import React from "react";
import "./App.css";
import Video from "./Video";

import { SharedColors } from "@uifabric/fluent-theme/lib/fluent/FluentColors";
import { Slider } from "office-ui-fabric-react/lib/Slider";
import {
  CommandBarButton,
  Stack,
  Modal,
  IconButton,
  MessageBar,
  MessageBarType,
  Link,
} from "office-ui-fabric-react";
import { mergeStyles } from "office-ui-fabric-react/lib/Styling";

import { initializeIcons } from "@uifabric/icons";
initializeIcons();

const commandBarStyles = mergeStyles({
  height: 35,
  marginBottom: 15,
});
const slideClass = mergeStyles({
  // marginLeft: 15,
  // marginRight: 15,
  margin: 0,
  height: "20rem",
});
const playButtonClass = mergeStyles({
  width: "5rem",
});
const modalClass = mergeStyles({
  borderTop: `4px solid ${SharedColors.cyanBlue10}`,
  display: "flex",
  alignItems: "center",
  padding: "12px 12px 14px 24px",
});

const DISABLED_ID = -1;

// One frame is around 0.0034... for 29.97FPS video
// const FRAME = 1 / 29.97;
const FRAME = 1 / 100;
// KEEP localStorage keys reference here
// const STORAGE = {
//   VIDEO: "video_blob",
// };

// ICONS
const playIcon = { iconName: "Play" };
const pauseIcon = { iconName: "Pause" };
const recordIcon = { iconName: "AddNotes" };
const prevIcon = { iconName: "Previous" };
const nextIcon = { iconName: "Next" };
const branchIcon = { iconName: "BranchFork2" };
const branchLockIcon = { iconName: "BranchLocked" };

function App() {
  // REFS
  const videoRef = React.useRef();
  const videoRef2 = React.useRef();

  // STATE
  const [playbackRate, setPlaybackRate] = React.useState(1.0);
  const [isSyncPlay, setIsSyncPlay] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [timestamps, addTimeStamp] = React.useState([]);

  const toggleModal = React.useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  // Only one video can listen to controls if not in sync mode
  const [activeVideoId, setActiveVideoId] = React.useState(DISABLED_ID);
  const activeVideoRef = React.useRef();

  const setRefById = React.useCallback((id) => {
    switch (id) {
      case 1:
        activeVideoRef.current = videoRef.current;
        break;
      case 2:
        activeVideoRef.current = videoRef2.current;
        break;
      default:
    }
  }, []);

  const getCurrentTime = (ref) => {
    if (ref) {
      return ref.current.currentTime;
    }
    return activeVideoRef.current.currentTime;
  };
  const setCurrentTime = (time, ref) => {
    if (ref) {
      ref.current.currentTime = time;
    } else {
      activeVideoRef.current.currentTime = time;
    }
  };
  const backwardFrame = React.useCallback(
    (multiplier = 1) => {
      if (isSyncPlay) {
        setCurrentTime(getCurrentTime(videoRef) - FRAME * multiplier, videoRef);
        setCurrentTime(
          getCurrentTime(videoRef2) - FRAME * multiplier,
          videoRef2
        );
      } else {
        setCurrentTime(getCurrentTime() - FRAME * multiplier);
      }
    },
    [isSyncPlay]
  );
  const forwardFrame = React.useCallback(
    (multiplier = 1) => {
      if (isSyncPlay) {
        setCurrentTime(getCurrentTime(videoRef) + FRAME * multiplier, videoRef);
        setCurrentTime(
          getCurrentTime(videoRef2) + FRAME * multiplier,
          videoRef2
        );
      } else {
        setCurrentTime(getCurrentTime() + FRAME * multiplier);
      }
    },
    [isSyncPlay]
  );
  const setPlayback = React.useCallback(
    (playback) => {
      // This is shared global
      setPlaybackRate(playback);
      if (isSyncPlay) {
        videoRef.current.playbackRate = playback;
        videoRef2.current.playbackRate = playback;
      } else {
        activeVideoRef.current.playbackRate = playback;
      }
    },
    [activeVideoRef, isSyncPlay]
  );
  const playAll = React.useCallback(() => {
    setIsPlaying(true);
    videoRef.current.play().catch((e) => console.error(e));
    videoRef2.current.play().catch((e) => console.error(e));
  }, [setIsPlaying]);
  const pauseAll = React.useCallback(() => {
    setIsPlaying(false);
    videoRef.current.pause();
    videoRef2.current.pause();
  }, [setIsPlaying]);
  const togglePlayback = React.useCallback(() => {
    if (isSyncPlay) {
      if (isPlaying) {
        pauseAll();
      } else {
        playAll();
      }
    } else {
      if (activeVideoRef.current.paused) {
        setIsPlaying(true);
        activeVideoRef.current.play().catch((e) => console.error(e));
      } else {
        setIsPlaying(false);
        activeVideoRef.current.pause();
      }
    }
  }, [isSyncPlay, activeVideoRef, isPlaying, pauseAll, playAll]);

  // Control sync play mode
  const toggleSyncPlay = React.useCallback(() => {
    setIsSyncPlay(!isSyncPlay);
    setActiveVideoId(DISABLED_ID);
    // Pause any playing video
    if (!isSyncPlay) {
      playAll();
    } else {
      pauseAll();
      // set last active again
      setActiveVideoId(1);
      activeVideoRef.current = videoRef.current;
    }
  }, [
    setIsSyncPlay,
    isSyncPlay,
    setActiveVideoId,
    activeVideoRef,
    videoRef,
    pauseAll,
    playAll,
  ]);

  const onVideoChange = React.useCallback(
    (id) => {
      if (!id) return;
      setActiveVideoId(id);
      setIsSyncPlay(false);
      setRefById(id);
    },
    [setActiveVideoId, setIsSyncPlay, setRefById]
  );

  // Are controls disabled (no video and no sync play)
  const disallowControls = React.useCallback(() => {
    if (isSyncPlay && activeVideoId === DISABLED_ID) {
      return false;
    } else if (activeVideoId !== DISABLED_ID) {
      return false;
    }
    return true;
  }, [isSyncPlay, activeVideoId]);

  const onKeyDown = React.useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (event.code === "Space") {
        // Avoid presssing last button/input user interacted with
        // It has to be done on keyup + keydown
        event.stopPropagation();
        event.preventDefault();
      }
      if (disallowControls()) return;
      if (event.type === "keydown") {
        console.log(event.code)
        switch (event.code) {
          case "ArrowLeft":
            event.stopPropagation();
            event.preventDefault();
            backwardFrame(event.shiftKey ? 50 : 1);
            break;
          case "ArrowRight":
            event.stopPropagation();
            event.preventDefault();
            forwardFrame(event.shiftKey ? 50 : 1);
            break;
          case "Space":
            event.stopPropagation();
            event.preventDefault();
            togglePlayback();
            break;
          case "Digit1":
            setPlayback(0.1);
            break;
          case "Digit2":
            setPlayback(0.15);
            break;
          case "Digit3":
            setPlayback(0.25);
            break;
          case "Digit4":
            setPlayback(0.35);
            break;
          case "Digit5":
            setPlayback(0.5);
            break;
          case "Digit6":
            setPlayback(0.75);
            break;
          case "Digit7":
            setPlayback(0.9);
            break;
          case "Digit8":
            setPlayback(1.5);
            break;
          case "Digit9":
            setPlayback(2.0);
            break;
          case "Digit0":
            setPlayback(1.0);
            break;
          case "KeyT":
            addNewTimeStamp();
            break;
          default:
        }
      }
      // Other than arrow keys, it also fired keypress
    },
    [disallowControls, backwardFrame, forwardFrame, setPlayback, togglePlayback]
  );

  // Register for Key Events
  React.useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      // remove listeners
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  const addNewTimeStamp = () => {
    addTimeStamp((prevTimeStamps) => [
      ...prevTimeStamps,
      getCurrentTime(),
    ])
  }

  return (
    <div className="App" style={{ backgroundColor: SharedColors.gray40 }}>
      <MessageBar
        messageBarType={MessageBarType.error}
        isMultiline={false}
        onDismiss={p.resetChoice}
        dismissButtonAriaLabel="Close"
      >
        This project has been moved:
        <Link href="https://trace-player.vercel.app" underline>
          Open new project URL.
        </Link>
      </MessageBar>
      <header className="App-header">
        <Stack horizontal className={commandBarStyles}>
          <CommandBarButton
            text={!isPlaying ? "Play" : "Pause"}
            iconProps={!isPlaying ? playIcon : pauseIcon}
            onClick={togglePlayback}
            disabled={disallowControls()}
            className={playButtonClass}
            primary
          />
          <CommandBarButton
            text={"Add timestamp"}
            iconProps={recordIcon}
            onClick={addNewTimeStamp}
            disabled={disallowControls()}
          />
          <CommandBarButton
            iconProps={prevIcon}
            disabled={disallowControls()}
            onClick={() => backwardFrame(1)}
          />
          <CommandBarButton
            iconProps={nextIcon}
            disabled={disallowControls()}
            onClick={() => forwardFrame(1)}
          />
          <CommandBarButton
            text={"Play Together"}
            iconProps={!isSyncPlay ? branchIcon : branchLockIcon}
            onClick={toggleSyncPlay}
            checked={isSyncPlay}
            toggle
            disabled={!videoRef.current || !videoRef2.current}
          />
          <CommandBarButton
            iconProps={{ iconName: "Info" }}
            onClick={toggleModal}
          />
        </Stack>

        <div
          style={{
            padding: 10,
            display: "flex",
            maxWidth: "100vw",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <Video
            id={1}
            ref={videoRef}
            activeId={activeVideoId}
            onVideoChange={onVideoChange}
          />
          <div
            style={{
              marginLeft: 15,
              marginRight: 15,
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            Playback
            <br />
            rate
            <Slider
              // label={`Speed`}
              showValue={false}
              min={0.1}
              max={3.0}
              step={0.05}
              vertical
              snapToStep
              onChange={setPlayback}
              value={playbackRate}
              className={slideClass}
              disabled={disallowControls()}
            />
            {playbackRate.toFixed(2)}x
          </div>
          {timestamps.length ? (
            <table>
              <thead>
              <tr>
                <th>Time</th>
                <th>Duration</th>
                <th>Controls</th>
              </tr>
              </thead>
              <tbody>
              {timestamps.map((time, index) => {
                return (
                  <tr>
                    <td>{time.toFixed(4)}</td>
                    <td>
                      {timestamps[index - 1] !== undefined
                        ? (time - timestamps[index - 1]).toFixed(4)
                        : "--"}
                    </td>
                    <td>
                      <IconButton
                        iconProps={{ iconName: "PaddingRight" }}
                        title="Jump to"
                        onClick={() => setCurrentTime(time)}
                      />
                      <IconButton
                        iconProps={{ iconName: "Delete" }}
                        title="Remove"
                        onClick={() => {
                          addTimeStamp(prevTimestamps => {
                            const clonedTimestamps = [...prevTimestamps];
                            const returned = clonedTimestamps.splice(index, 1)
                            console.log({
                              returned,
                              clonedTimestamps
                            })
                            return clonedTimestamps;
                          })
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          ) : (
            <Video
              id={2}
              ref={videoRef2}
              activeId={activeVideoId}
              onVideoChange={onVideoChange}
            />
          )}
        </div>

        {/* MODAL */}
        <Modal
          isOpen={isModalOpen}
          onDismiss={toggleModal}
          isBlocking={false}
          containerClassName={modalClass}
        >
          <h3>About</h3>
          This app can be used to compare two recorded video. Mostly suitable to
          compare performance in app.
          <br />
          <strong>Play Together</strong> toggle will allow play both videos at
          same rate with shared playback controls.
          <br />
          Currently there is no plan to add screen recording feature, since OS
          like macOS does have this feature built in.
          <h3>Shortcuts</h3>
          <table style={{ width: "100%" }}>
            <tr>
              <th>Shortcut</th>
              <th>Action</th>
            </tr>
            <tr>
              <td>SPACE</td>
              <td>Play/Pause</td>
            </tr>
            <tr>
              <td>ARROW RIGHT</td>
              <td>Go 1ms forward</td>
            </tr>
            <tr>
              <td>ARROW LEFT</td>
              <td>Go 1ms backward</td>
            </tr>
            <tr>
              <td>SHIFT + ARROW RIGHT</td>
              <td>Go 50ms forward</td>
            </tr>
            <tr>
              <td>SHIFT + ARROW LEFT</td>
              <td>Go 50ms backward</td>
            </tr>
            <tr>
              <td>NUM 0 - 9</td>
              <td>
                Set playback rate from 0.1 to 2.0. <br />
                (except 0 = 1.0)
              </td>
            </tr>
            <tr>
              <td>t</td>
              <td>Add timestamps</td>
            </tr>
          </table>
          <h3>Author</h3>
          Lukas Kurucz
        </Modal>
      </header>
    </div>
  );
}

export default App;