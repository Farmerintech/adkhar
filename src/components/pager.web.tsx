// components/PagerView.web.tsx
import React, { forwardRef, useImperativeHandle } from "react";
import { View, ViewProps } from "react-native";

export interface PagerViewRef {
  setPage: (page: number) => void;
}

type PagerProps = ViewProps & {
  children: React.ReactNode;
  initialPage?: number;
  layoutDirection?: "ltr" | "rtl";
  onPageSelected?: (e: { nativeEvent: { position: number } }) => void;
};

const PagerView = forwardRef<PagerViewRef, PagerProps>(
  ({ children, style, ...props }, ref) => {
    useImperativeHandle(ref, () => ({
      setPage: (_page: number) => {
        // Page switching on Web is managed directly via React state
      },
    }));

    return (
      <View style={[{ flex: 1 }, style]} {...props}>
        {children}
      </View>
    );
  },
);

PagerView.displayName = "PagerView";

export default PagerView;
