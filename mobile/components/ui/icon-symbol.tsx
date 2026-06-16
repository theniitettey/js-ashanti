// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'chart.bar.fill': 'bar-chart',
  'chart.pie.fill': 'pie-chart',
  'chart.xyaxis.line': 'show-chart',
  'bell.fill': 'notifications',
  'gearshape.fill': 'settings',
  'cube.box.fill': 'inventory-2',
  'shippingbox.fill': 'inventory',
  'magnifyingglass': 'search',
  'slider.horizontal.3': 'tune',
  'arrow.clockwise': 'refresh',
  'arrow.up.right': 'trending-up',
  'arrow.down.right': 'trending-down',
  'arrow.down.doc.fill': 'file-download',
  'plus': 'add',
  'xmark': 'close',
  'checkmark': 'check',
  'pencil': 'edit',
  'trash': 'delete',
  'photo': 'image',
  'photo.on.rectangle': 'photo-library',
  'camera': 'camera-alt',
  'sparkles': 'auto-awesome',
  'bubble.left.fill': 'chat',
  'dollarsign.circle.fill': 'attach-money',
  'bag.fill': 'shopping-bag',
  'person.fill': 'person',
  'envelope.fill': 'email',
  'key.fill': 'vpn-key',
  'moon.fill': 'dark-mode',
  'globe': 'language',
  'lifepreserver.fill': 'help',
  'headphones': 'headset',
  'doc.text.fill': 'description',
  'message.fill': 'message',
  'rectangle.portrait.and.arrow.right': 'logout',
  'info': 'info',
  'calendar': 'calendar-today',
  'hourglass': 'hourglass-empty',
  'number': 'tag',
  'exclamationmark.triangle.fill': 'warning',
  'tray': 'inbox',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const materialName = MAPPING[name];
  if (!materialName) {
    return <MaterialIcons color={color} size={size} name="help-outline" style={style} />;
  }
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}
