let peerConnection;
let localStream;
let remoteStream;

let servers = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
};
const init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  document.getElementById("video-1").srcObject = localStream;
};

const createPeerConnection = (sdpType) => {
  peerConnection = new RTCPeerConnection(servers);
  remoteStream = new MediaStream();
  document.getElementById("video-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      document.getElementById(sdpType + "-sdp").value = JSON.stringify(
        peerConnection.localDescription
      );
    }
  };
};

init();

const createOffer = async () => {
  await createPeerConnection("offer");
  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  document.getElementById("offer-sdp").value = JSON.stringify(offer);
};

const createAnswer = async () => {
  await createPeerConnection("answer");
  let offer = document.getElementById("offer-sdp").value;
  if (!offer) return alert("No offer");

  offer = JSON.parse(offer);
  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  document.getElementById("answer-sdp").value = JSON.stringify(answer);
};

const addAnswer = async () => {
  let answer = document.getElementById("answer-sdp").value;
  if (!answer) return alert("No answer");
  answer = JSON.parse(answer);
  const currentRemoteDescription = peerConnection.remoteDescription;
  if (currentRemoteDescription === null) {
    await peerConnection.setRemoteDescription(answer);
  } else {
    console.log("Remote description is already set.");
  }
};

document.getElementById("create-offer").addEventListener("click", createOffer);
document
  .getElementById("create-answer")
  .addEventListener("click", createAnswer);
document.getElementById("add-answer").addEventListener("click", addAnswer);
