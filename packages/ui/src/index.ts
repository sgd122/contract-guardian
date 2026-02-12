// Utilities
export { cn } from "./lib/utils";

// Motion variants
export {
  pageVariants,
  cardRevealVariants,
  staggerContainerVariants,
  gaugeVariants,
  hoverLift,
  pulseVariants,
} from "./lib/motion-variants";

// Hooks
export { useReducedMotion } from "./hooks/use-reduced-motion";
export { useAnimationConfig, type AnimationConfig } from "./hooks/use-animation-config";

// Base UI components
export { Button, buttonVariants, type ButtonProps } from "./components/ui/button";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/ui/card";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
export { Badge, badgeVariants, type BadgeProps } from "./components/ui/badge";
export { Input, type InputProps } from "./components/ui/input";
export { Progress, type ProgressProps } from "./components/ui/progress";
export { Skeleton } from "./components/ui/skeleton";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./components/ui/tooltip";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./components/ui/dropdown-menu";

// Animated components
export { AnimatedCard, type AnimatedCardProps } from "./components/animated/animated-card";
export { PageTransition, type PageTransitionProps } from "./components/animated/page-transition";
export { RiskGauge, type RiskGaugeProps } from "./components/animated/risk-gauge";
export { UploadDropzone, type UploadDropzoneProps } from "./components/animated/upload-dropzone";
export { ProgressBar, type ProgressBarProps } from "./components/animated/progress-bar";
export { FadeIn, type FadeInProps } from "./components/animated/fade-in";
export { StaggerList, type StaggerListProps } from "./components/animated/stagger-list";
export { SlidePanel, type SlidePanelProps } from "./components/animated/slide-panel";
export { CountUp, type CountUpProps } from "./components/animated/count-up";
