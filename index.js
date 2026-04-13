import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import TrackPlayer from "react-native-track-player";
import { PlaybackService } from "./src/services/PlaybackService";

TrackPlayer.registerPlaybackService(() => PlaybackService);

const App = () => <ExpoRoot context={require.context("./app")} />;
export default registerRootComponent(App);