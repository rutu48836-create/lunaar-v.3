import { Composition, getInputProps } from "remotion";
import { lazy, Suspense } from "react";

type InputProps = {
  jobId: string;
  width?: number;
  height?: number;
  fps?: number;
  durationInFrames?: number;
};

const {
  jobId,
  width = 1080,
  height = 1080,
  fps = 30,
  durationInFrames = 150,
} = getInputProps() as InputProps;

const GeneratedComp = lazy(() => import(`./generated/${jobId}.tsx`));

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MyComposition"
    component={(props) => (
      <Suspense fallback={null}>
        <GeneratedComp {...props} />
      </Suspense>
    )}
    durationInFrames={Number(durationInFrames)}
    fps={Number(fps)}
    width={Number(width)}
    height={Number(height)}
  />
);