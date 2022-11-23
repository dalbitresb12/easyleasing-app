import { MutableRefObject, Ref, useEffect, useRef } from "react";

export const useCombinedRefs = <T>(...refs: Ref<T | undefined>[]): MutableRefObject<T | undefined> => {
  const targetRef = useRef<T | undefined>();

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref || !targetRef.current) return;

      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        const mutableRef = ref as MutableRefObject<T | undefined>;
        mutableRef.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
};
