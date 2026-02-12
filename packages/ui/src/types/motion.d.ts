// Fix React 19 + motion/react type incompatibility
// See: https://github.com/motiondivision/motion/issues/2887
import "motion/react";

declare module "motion/react" {
  interface MotionProps {
    children?: React.ReactNode;
  }
}
