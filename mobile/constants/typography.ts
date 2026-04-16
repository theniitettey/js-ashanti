import { PixelRatio } from "react-native";

const round = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n));

const Typography = {
  xs: round(12),
  sm: round(14),
  md: round(16),
  lg: round(18),
  xl: round(22),
  xxl: round(28),
};
export default Typography;
