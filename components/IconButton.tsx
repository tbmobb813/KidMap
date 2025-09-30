import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';

type IconButtonProps = PressableProps & {
  style?: ViewStyle;
  hitSlop?: PressableProps['hitSlop'];
};

const IconButton: React.FC<IconButtonProps> = ({ children, hitSlop, style, ...rest }) => {
  // Provide a small default hitSlop so icon-only buttons meet touch target
  // recommendations without forcing visual padding changes.
  const defaultHitSlop = hitSlop ?? 8;

  return (
    <Pressable hitSlop={defaultHitSlop} style={style} {...rest}>
      {children}
    </Pressable>
  );
};

export default IconButton;
