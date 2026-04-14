"use client";

import {
  Skeleton as BoneyardSkeleton,
  configureBoneyard,
  type SkeletonProps as BoneyardSkeletonProps,
} from "boneyard-js/react";

configureBoneyard({
  animate: "pulse",
  color: "var(--skeleton-base)",
  darkColor: "var(--skeleton-base)",
});

type AppBoneyardSkeletonProps = BoneyardSkeletonProps;

export function AppBoneyardSkeleton(props: AppBoneyardSkeletonProps) {
  return <BoneyardSkeleton transition={300} {...props} />;
}
