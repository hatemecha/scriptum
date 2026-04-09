"use client";

import {
  Skeleton as BoneyardSkeleton,
  configureBoneyard,
  type SkeletonProps as BoneyardSkeletonProps,
} from "boneyard-js/react";

configureBoneyard({
  animate: "pulse",
  color: "rgba(18, 22, 31, 0.08)",
  darkColor: "rgba(255, 255, 255, 0.08)",
});

type AppBoneyardSkeletonProps = BoneyardSkeletonProps;

export function AppBoneyardSkeleton(props: AppBoneyardSkeletonProps) {
  return <BoneyardSkeleton transition={300} {...props} />;
}
