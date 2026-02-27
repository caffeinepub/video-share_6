import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";

import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Video {
    public func compareByTimestamp(video1 : Video, video2 : Video) : Order.Order {
      Int.compare(video2.uploadedAt, video1.uploadedAt);
    };
  };

  type Video = {
    id : Blob;
    title : Text;
    description : Text;
    externalBlob : Storage.ExternalBlob;
    uploader : Principal;
    uploadedAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  let videosState = Map.empty<Blob, Video>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Video management
  public shared ({ caller }) func uploadVideo(title : Text, description : Text, externalBlob : Storage.ExternalBlob) : async Blob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload videos");
    };

    let videoId = externalBlob;

    let video : Video = {
      id = videoId;
      title;
      description;
      externalBlob;
      uploader = caller;
      uploadedAt = Time.now();
    };

    videosState.add(videoId, video);
    videoId;
  };

  public shared ({ caller }) func deleteVideo(videoId : Blob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };

    switch (videosState.get(videoId)) {
      case (null) {
        Runtime.trap("Video not found");
      };
      case (?_) {
        videosState.remove(videoId);
      };
    };
  };

  public query ({ caller }) func getAllVideos() : async [Video] {
    videosState.values().toArray().sort(Video.compareByTimestamp);
  };

  public query ({ caller }) func getVideo(videoId : Blob) : async ?Video {
    videosState.get(videoId);
  };
};
