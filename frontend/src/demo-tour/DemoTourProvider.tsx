import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { useBusiness } from '../context/BusinessContext';
import { useConfigurator } from '../context/ConfiguratorContext';
import { DemoTourContext, type DemoTourContextValue } from './context';
import { DemoFinish } from './DemoFinish';
import { DemoIntro } from './DemoIntro';
import { DemoTourOverlay } from './DemoTourOverlay';
import {
  canRunSalesDemoTour,
  canShowSalesDemoChrome,
  isSalesDemoAdminPath,
  shouldAutoStartTour,
} from './eligibility';
import { browserStorage, createTourStorage } from './storage';
import { findTourTarget, paddedRect, waitForTourTarget } from './targets';
import type { DemoTourDefinition, TourStep } from './types';

type TourPhase = 'idle' | 'intro' | 'tour' | 'finish';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
}

export function DemoTourProvider({
  definition,
  children,
}: {
  definition: DemoTourDefinition;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDemo, isTelegram } = useApp();
  const business = useBusiness();
  const configurator = useConfigurator();
  const storage = useMemo(
    () => createTourStorage(definition.storageKey, browserStorage()),
    [definition.storageKey],
  );

  const [phase, setPhase] = useState<TourPhase>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const runIdRef = useRef(0);

  const isAdminPath = isSalesDemoAdminPath(location.pathname);
  const demoTourEnabled = Boolean(business.features.demoTour);
  const demoAdminPreviewEnabled = Boolean(business.features.demoAdminPreview);
  const eligibility = useMemo(
    () => ({
      isDemo,
      isTelegram,
      demoMode: business.demoMode,
      demoTourEnabled,
      isAdminPath,
    }),
    [isDemo, isTelegram, business.demoMode, demoTourEnabled, isAdminPath],
  );

  const showChrome = canShowSalesDemoChrome({
    ...eligibility,
    demoAdminPreviewEnabled,
  });

  const closeTour = useCallback(() => {
    runIdRef.current += 1;
    setPhase('idle');
    setSpotlight(null);
  }, []);

  const skip = useCallback(() => {
    storage.markSeen('skipped');
    closeTour();
  }, [closeTour, storage]);

  const complete = useCallback(() => {
    storage.markSeen('completed');
    setSpotlight(null);
    setPhase('finish');
  }, [storage]);

  const applyAction = useCallback(
    async (step: TourStep) => {
      if (step.action === 'fill-configurator') {
        const [projects, materials, packages] = await Promise.all([
          api.getProjects(),
          api.getMaterials(),
          api.getPackages(),
        ]);
        const project = projects.data.find((item) => item.slug === 'nordic-125') ?? projects.data[0];
        const material = materials.data[0];
        const pkg = packages.data.find((item) => item.slug === 'prefinish') ?? packages.data[1];
        if (!project || !material || !pkg) return;
        const quote = await api.calculateQuote({
          projectId: project.id,
          area: 142,
          materialId: material.id,
          packageId: pkg.id,
        });
        configurator.fillDemoDraft({
          projectId: project.id,
          projectSlug: project.slug,
          area: 142,
          materialId: material.id,
          packageId: pkg.id,
          quote: quote.data,
          hasLand: 'yes',
          region: 'Московская область',
          desiredStartPeriod: '1_3',
          budgetRange: '10_15',
          name: 'Иван Петров',
        });
        return;
      }
      if (step.action === 'open-hot-lead') {
        const list = await api.getDemoAdminLeads('?temperature=hot');
        const target = list.data[0];
        if (target) navigate(`/demo/admin/leads/${target.id}`);
        return;
      }
      if (step.action === 'open-house') {
        navigate('/house');
        return;
      }
      if (step.action === 'open-photos') {
        navigate('/house/updates');
      }
    },
    [configurator, navigate],
  );

  const goToStep = useCallback(
    async (index: number) => {
      const step = definition.steps[index];
      if (!step) {
        complete();
        return;
      }
      const runId = ++runIdRef.current;
      setStepIndex(index);
      setPhase('tour');
      setSpotlight(null);
      try {
        await applyAction(step);
        if (runId !== runIdRef.current) return;
        if (step.route && location.pathname !== step.route.split('?')[0] && !step.action?.startsWith('open-')) {
          navigate(step.route);
        }
        const node = await waitForTourTarget(step.target, { timeoutMs: step.waitMs ?? 2800 });
        if (runId !== runIdRef.current) return;
        if (node instanceof HTMLElement) {
          node.scrollIntoView({ block: 'center', behavior: 'smooth', inline: 'nearest' });
          const measure = () => {
            if (runId !== runIdRef.current) return;
            const live = findTourTarget(step.target);
            if (live instanceof HTMLElement) {
              setSpotlight(paddedRect(live.getBoundingClientRect()));
            } else {
              setSpotlight(null);
            }
          };
          window.setTimeout(measure, 220);
          measure();
        } else {
          setSpotlight(null);
        }
      } catch {
        if (runId === runIdRef.current) setSpotlight(null);
      }
    },
    [applyAction, complete, definition.steps, location.pathname, navigate],
  );

  const start = useCallback(() => {
    if (!canRunSalesDemoTour(eligibility)) return;
    setPhase('intro');
  }, [eligibility]);

  const beginSteps = useCallback(() => {
    storage.markSeen('completed');
    void goToStep(0);
  }, [goToStep, storage]);

  useEffect(() => {
    if (phase !== 'idle') return;
    if (
      shouldAutoStartTour({
        isDemo,
        isTelegram,
        demoMode: business.demoMode,
        demoTourEnabled,
        isAdminPath,
        hasBeenSeen: storage.hasBeenSeen(),
      })
    ) {
      setPhase('intro');
    }
  }, [phase, isDemo, isTelegram, business.demoMode, demoTourEnabled, isAdminPath, storage]);

  useEffect(() => {
    if (phase !== 'tour') return;
    const step = definition.steps[stepIndex];
    if (!step) return;
    const sync = () => {
      const node = findTourTarget(step.target);
      if (node instanceof HTMLElement) {
        setSpotlight(paddedRect(node.getBoundingClientRect()));
      }
    };
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [definition.steps, phase, stepIndex]);

  const value = useMemo<DemoTourContextValue>(
    () => ({ start, skip, showChrome, demoTourEnabled, demoAdminPreviewEnabled }),
    [demoAdminPreviewEnabled, demoTourEnabled, showChrome, skip, start],
  );

  const step = definition.steps[stepIndex];

  return (
    <DemoTourContext.Provider value={value}>
      {children}
      {phase === 'intro' && canRunSalesDemoTour(eligibility) && (
        <DemoIntro intro={definition.intro} onStart={beginSteps} onSkip={skip} />
      )}
      {phase === 'tour' && step && (
        <DemoTourOverlay
          step={step}
          stepIndex={stepIndex}
          stepCount={definition.steps.length}
          targetRect={spotlight}
          onNext={() => {
            if (stepIndex >= definition.steps.length - 1) {
              complete();
              return;
            }
            void goToStep(stepIndex + 1);
          }}
          onBack={() => {
            if (stepIndex <= 0) return;
            void goToStep(stepIndex - 1);
          }}
          onSkip={skip}
        />
      )}
      {phase === 'finish' && (
        <DemoFinish
          finish={definition.finish}
          showAdmin={demoAdminPreviewEnabled && business.demoMode}
          onAdmin={() => {
            closeTour();
            navigate('/demo/admin');
          }}
          onContinue={() => {
            closeTour();
            navigate('/');
          }}
        />
      )}
    </DemoTourContext.Provider>
  );
}
