import { Helmet } from "react-helmet-async";
import useAuth from "../../hooks/useAuth";
import TopBarContent from "./TopBarContent/TopBarContent";
import MyFriends from "./MyFriends/MyFriends";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MiddleSection from "./MiddleSection";

export enum RelationshipStatus {
  FRIEND = "friend",
  PENDING = "pending",
  REQUESTED = "requested",
  NOTFRIEND = "notFriend",
}

function Userpage() {
  const { socket, user } = useAuth();
  const [requestedUser, setRequestedUser]: any = useState({});
  const [relationshipStatus, setRelationshipStatus]: any =
    useState<RelationshipStatus>(RelationshipStatus.NOTFRIEND);
  const navigate = useNavigate();

  const userId = parseInt(useParams().userId);
  let isMyProfile = userId === user.id;

  useEffect(() => {
    socket.on("getUserById", (response) => {
      setRequestedUser(response);
    });
    socket.on("getFriendshipStatus", (response) => {
      setRelationshipStatus(response);
    });
    socket.on("getFriendshipNotify", (response) => {
      socket.emit("getFriendshipStatus", userId);
    });
		socket.on("getUsersNotify", () => {
			socket.emit("getUserById", userId);
		})

    try {
      socket.emit("getUserById", userId, (res) => {
        if (res.status != 200) navigate("/");
      });
    } catch (err) {
      console.error("Error response:");
      console.error(err);
    }

    return () => {
			socket.off("getUsersNotify")
      socket.off("getUserById");
      socket.off("getFriendshipStatus");
      socket.off("getFriendshipNotify");
    };
  }, []);

  useEffect(() => {
    try {
      socket.emit("getFriendshipStatus", userId);
    } catch (err) {
      console.error("Error response:");
      console.error(err);
    }
  }, [requestedUser]);

  //scroll to MyFriends
  const refToMyFriends = useRef(null);
  const handleScrollToMyFriends = () => {
    refToMyFriends.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>Userpage</title>
      </Helmet>
      {requestedUser.id != undefined && (
        <>
          <TopBarContent
            isMyProfile={isMyProfile}
            requestedUser={isMyProfile ? user : requestedUser}
            relationshipStatus={relationshipStatus}
            setRelationshipStatus={setRelationshipStatus}
            handleScrollToMyFriends={handleScrollToMyFriends}
          />
          <MiddleSection requestedUser={isMyProfile ? user : requestedUser} />
          <div ref={refToMyFriends}>
            {isMyProfile ? (
              <MyFriends setRequestedUser={setRequestedUser} />
            ) : null}
          </div>
        </>
      )}
    </>
  );
}

export default Userpage;
