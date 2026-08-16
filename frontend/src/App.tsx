import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DemoChrome } from './demo-tour/DemoChrome';
import { isSalesDemoAdminPath } from './demo-tour/eligibility';
import { useDemoTour } from './demo-tour/context';
import {
  AdminCatalogPage,
  AdminLeadPage,
  AdminPage,
  DemoAdminLeadPage,
  DemoAdminPage,
} from './pages/AdminPage';
import { CatalogPage } from './pages/CatalogPage';
import { ConfigurePage } from './pages/ConfigurePage';
import { HomePage } from './pages/HomePage';
import {
  HouseDocumentsPage,
  HousePage,
  HousePaymentsPage,
  HouseStagesPage,
  HouseUpdatesPage,
} from './pages/HousePage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { QualifyPage } from './pages/QualifyPage';
import { QuotePage } from './pages/QuotePage';
import { ThanksPage } from './pages/ThanksPage';

export default function App() {
  const location = useLocation();
  const isAdmin = isSalesDemoAdminPath(location.pathname);
  const tour = useDemoTour();

  return (
    <div className={isAdmin ? undefined : 'app-shell'}>
      {tour.showChrome && (
        <DemoChrome
          showTour={tour.demoTourEnabled}
          showAdmin={tour.demoAdminPreviewEnabled}
          onStartTour={tour.start}
        />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<CatalogPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailsPage />} />
        <Route path="/configure" element={<ConfigurePage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/qualify" element={<QualifyPage />} />
        <Route path="/qualify/thanks" element={<ThanksPage />} />
        <Route path="/house" element={<HousePage />} />
        <Route path="/house/stages" element={<HouseStagesPage />} />
        <Route path="/house/updates" element={<HouseUpdatesPage />} />
        <Route path="/house/documents" element={<HouseDocumentsPage />} />
        <Route path="/house/payments" element={<HousePaymentsPage />} />
        <Route path="/demo/admin" element={<DemoAdminPage />} />
        <Route path="/demo/admin/leads/:id" element={<DemoAdminLeadPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/leads/:id" element={<AdminLeadPage />} />
        <Route path="/admin/catalog" element={<AdminCatalogPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
