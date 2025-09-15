import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
  createLinkSchema,
  destinationsSchema,
} from "@repo/data-ops/zod-schema/links";

import { TRPCError } from "@trpc/server";

import { createLink, getLinks, getLink, updateLinkName, updateLinkDestinations, activeLinksLastHour, getLast24And48HourClicks, getLast30DaysClicks, totalLinkClickLastHour, getLast30DaysClicksByCountry } from "@repo/data-ops/queries/links";

export const linksTrpcRoutes = t.router({
  linkList: t.procedure
    .input(
      z.object({
        offset: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await getLinks(ctx.userInfo.userId, input.offset?.toString());
    }),

  createLink: t.procedure.input(createLinkSchema).mutation(async ({ctx,input}) => {
    const linkId = await createLink({
      ...input,
      accountId: ctx.userInfo.userId,
    })
    return linkId;
  }),

  updateLinkName: t.procedure
    .input(
      z.object({
        linkId: z.string(),
        name: z.string().min(1).max(300),
      }),
    )
    .mutation(async ({ input }) => {
      await updateLinkName(input.linkId, input.name)
    }),

  getLink: t.procedure
    .input(
      z.object({
        linkId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const data = await getLink(input.linkId)

      if (!data) throw new TRPCError({ code: "NOT_FOUND" });
      return data;
    }),

  updateLinkDestinations: t.procedure
    .input(
      z.object({
        linkId: z.string(),
        destinations: destinationsSchema,
      }),
    )
    .mutation(async ({ input }) => {
      await updateLinkDestinations(input.linkId, input.destinations)
    }),

  activeLinks: t.procedure.query(async ({ ctx }) => {
    return activeLinksLastHour(ctx.userInfo.userId);
  }),

  totalLinkClickLastHour: t.procedure.query(async ({ ctx }) => {
    return totalLinkClickLastHour(ctx.userInfo.userId);
  }),

  last24HourClicks: t.procedure.query(async ({ ctx }) => {
    return getLast24And48HourClicks(ctx.userInfo.userId);
  }),

  last30DaysClicks: t.procedure.query(async ({ ctx }) => {
    return getLast30DaysClicks(ctx.userInfo.userId);
  }),

  clicksByCountry: t.procedure.query(async ({ ctx }) => {
    return getLast30DaysClicksByCountry(ctx.userInfo.userId);
  }),
});
