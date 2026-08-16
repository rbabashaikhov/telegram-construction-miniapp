import { z } from 'zod';
import { AppError } from '../errors.js';
import { buildQuoteCalculation } from '../domain/pricing.js';
import type { Providers } from '../providers/types.js';
import type { QuoteCalculation, QuoteOption } from '../types.js';

export const calculateQuoteSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  area: z.coerce.number().int().min(40).max(500),
  materialId: z.coerce.number().int().positive(),
  packageId: z.coerce.number().int().positive(),
  options: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        name: z.string().min(1).max(120),
        price: z.number().int().min(0).max(20_000_000),
      }),
    )
    .max(10)
    .optional()
    .default([]),
});

export type CalculateQuoteInput = z.infer<typeof calculateQuoteSchema>;

export function resolveQuote(data: Providers, input: CalculateQuoteInput): QuoteCalculation {
  const project = data.catalog.getProject(input.projectId);
  if (!project || !project.active) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  }
  const material = data.catalog.getMaterial(input.materialId);
  if (!material || !material.active) {
    throw new AppError('Material not found', 404, 'MATERIAL_NOT_FOUND');
  }
  const pkg = data.catalog.getPackage(input.packageId);
  if (!pkg || !pkg.active) {
    throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
  }
  if (project.areaOptions.length && !project.areaOptions.includes(input.area)) {
    const nearest = project.areaOptions.reduce((best: number, option: number) =>
      Math.abs(option - input.area) < Math.abs(best - input.area) ? option : best,
    );
    if (Math.abs(nearest - input.area) > 40) {
      throw new AppError('Requested area is outside project options', 400, 'AREA_NOT_ALLOWED');
    }
  }
  const options: QuoteOption[] = input.options ?? [];
  return buildQuoteCalculation({
    project,
    area: input.area,
    material,
    package: pkg,
    options,
  });
}
