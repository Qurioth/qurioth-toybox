// 画像import(*.png 等)の型。通常は next-env.d.ts が同じ参照を持つが、
// あのファイルは .gitignore 対象で `next build` が生成するものなので、
// ビルド前に `tsc --noEmit` だけを走らせるCIでは存在しない。
/// <reference types="next/image-types/global" />

declare module "*.css";
