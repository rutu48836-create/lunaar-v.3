import { Composition } from "remotion";
import { Renderer } from "./renderer";

const DEFAULT_SCENE_DURATION = 90;
const DEFAULT_TRANSITION_DURATION = 15;

function computeTotalDuration(scenes: any[], transitions: any[]) {
  const sceneTotal = scenes.reduce(
    (sum, s) => sum + (s.durationInFrames || DEFAULT_SCENE_DURATION),
    0
  );
  const overlapTotal = transitions.reduce(
    (sum, t) => sum + (t?.type === "cut" ? 0 : (t?.durationInFrames || DEFAULT_TRANSITION_DURATION)),
    0
  );
  return Math.max(sceneTotal - overlapTotal, 30);
}

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Renderer"
      component={Renderer}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{ background: "#000000", elements: [] }}
      calculateMetadata={async ({ props }) => {
        const scenes = (props as any).scenes;
        const transitions = (props as any).transitions;

        if (scenes && scenes.length) {
          return {
            durationInFrames: computeTotalDuration(scenes, transitions || []),
          };
        }

        return {};
      }}
    />
  );
};