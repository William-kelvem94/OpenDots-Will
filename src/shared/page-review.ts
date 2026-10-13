import { z } from 'zod';
export const pageReviewSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    content: z.string().min(1).max(20000),
    spaceId: z.string().min(1),
  })
  .strict();
export type PageReviewDraft = z.infer<typeof pageReviewSchema>;
export const pageReviewTool = {
  name: 'review_space_page',
  description:
    'Apresente um rascunho em Markdown para revisão humana antes de salvá-lo em um espaço autorizado. A pessoa pode aprovar e salvar ou recusar. Não crie a página por conta própria após esta ferramenta: o resultado aprovado inclui o link da página salva. Chame uma vez e aguarde o resultado da revisão.',
  parameters: z.toJSONSchema(pageReviewSchema),
};
