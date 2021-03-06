import WhiteboardMultiUser from '/imports/api/2.0/whiteboard-multi-user/';
import Auth from '/imports/ui/services/auth';
import Cursor from '/imports/api/2.0/cursor';
import Users from '/imports/api/2.0/users';

const getMultiUserStatus = () => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID });

  if (data) {
    return data.multiUser;
  }

  return false;
};

const getPresenterCursorId = userId => Cursor.findOne({ userId }, { fields: { _id: 1 } });

const getCurrentCursorIds = () => {
  // object to return
  const data = {};

  // fetching the presenter's id
  const user = Users.findOne({ presenter: true }, { fields: { userId: 1 } });

  if (user) {
    // fetching the presenter cursor id
    data.presenterCursorId = getPresenterCursorId(user.userId);
  }

  // checking whether multiUser mode is on or off
  const isMultiUser = getMultiUserStatus();

  if (isMultiUser && data.presenterCursorId) {
    // it's a multi-user mode - fetching all the cursors except the presenter's
    const selector = {
      _id: {
        $ne: data.presenterCursorId._id,
      },
    };
    const filter = {
      fields: {
        _id: 1,
      },
    };
    data.multiUserCursorIds = Cursor.find(selector, filter).fetch();
  } else {
    // it's not multi-user, assigning an empty array
    data.multiUserCursorIds = [];
  }

  return data;
};

export default {
  getCurrentCursorIds,
  getMultiUserStatus,
};
