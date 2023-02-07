import React, { useRef, useCallback, forwardRef, useEffect } from "react";
import { SharedColors } from "@uifabric/fluent-theme/lib/fluent/FluentColors";
import { NeutralColors } from "@uifabric/fluent-theme/lib/fluent/FluentColors";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { mergeStyles } from "office-ui-fabric-react/lib/Styling";
const iconClass = mergeStyles({
  fontSize: 50,
  height: 50,
  width: 50,
  position: "absolute",
  top: "calc(50% - 25px)",
  left: "calc(50% - 25px)",
  color: SharedColors.cyanBlue20,
});
const videoWrapperClass = mergeStyles({
  position: "relative",
  borderColor: SharedColors.cyanBlue20,
  borderWidth: 4,
  borderStyle: "dashed",
  // Aspect ratio 16:9
  paddingTop: "177%",
  width: "calc(100% - 8px)",
  borderRadius: 16,
  backgroundColor: NeutralColors.gray160,
  transition: "all .1s ease-out",
  opacity: 0.7,
  selectors: {
    ":hover": {
      transform: "scale(1.005)",
      opacity: 1,
      transition: "all .5s cubic-bezier(0.68, -0.55, 0.27, 4.55)",
    },
  },
});

const Video = forwardRef(({ onVideoChange, activeId, id }, videoRef) => {
  // Refs
  const timestampRef = useRef();
  // State
  const [videoSrc, setVideoSrc] = React.useState();
  // Effects
  useEffect(() => {
    if (!videoSrc) return;
    onVideoChange(id);
  }, [videoSrc, id, onVideoChange]);
  // Callbacks
  // Select video files
  const onChange = React.useCallback((event) => {
    const files = event.target.files;
    if (files && files[0]) {
      const blobURL = URL.createObjectURL(files[0]);
      setVideoSrc(blobURL);
    }
  }, []);
  const updateTimestamp = useCallback((value) => {
    const formatedTime = `${Math.floor(value / 60)}:${Math.floor(value)}:${
      value.toFixed(2).split(".")[1]
    }`;
    timestampRef.current.innerText = formatedTime;
  }, []);
  const onTimeUpdate = useCallback(
    (event) => updateTimestamp(event.target.currentTime),
    [updateTimestamp]
  );
  const onVideoClick = React.useCallback(() => {
    onVideoChange(id);
  }, [onVideoChange, id]);

  if (!videoSrc)
    return (
      <div style={{ width: 375, maxWidth: "40%" }}>
        <div className={videoWrapperClass}>
          <Icon iconName="CircleAddition" className={iconClass} />
          <input
            type="file"
            accept="video/*"
            onChange={onChange}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
          />
        </div>
      </div>
    );
  return (
    <div
      style={{
        position: "relative",
      }}
      onClick={onVideoClick}
    >
      <div
        ref={timestampRef}
        style={{
          position: "absolute",
          top: 5,
          left: 5,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          fontVariantNumeric: "tabular-nums",
          borderRadius: 6,
          padding: "2px 5px",
          fontFamily: "monospace",
          fontSize: "2rem",
        }}
      >
        0:0:00
      </div>
      <video
        onTimeUpdate={onTimeUpdate}
        ref={videoRef}
        // FIXME: this is bugy since spacebar will invoke last interacted element
        // controls
        src={videoSrc}
        controls
        muted
        controlsList={'nofullscreen'}
        style={{
          borderRadius: 6,
          maxHeight: "calc(100vh - 200px)",
          maxWidth: "100%",
          ...(activeId === id
            ? {
                boxShadow:
                  "#ffaa44 0px 3.2px 7.2px 0px, #ffaa44 0px 0.6px 10px 0px",
              }
            : {}),
        }}
      ></video>
    </div>
  );
});

export default Video;
