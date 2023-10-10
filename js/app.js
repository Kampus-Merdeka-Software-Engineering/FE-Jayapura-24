const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');
const BASE_URL = 'https://be-jayapura-24-production.up.railway.app'

if (bar) {
        bar.addEventListener('click', () => {
            nav.classList.add('active');
        });
}

if (close) {
  close.addEventListener('click', () => {
      nav.classList.remove('active');
  });
}

const data = {
    currentUser: {
      image: {
        png: "./images/avatars/6.png",
        webp: "./images/avatars/6.webp",
      },
      username: "Fikri",
    },
    comments: [
      // {
      //   parent: 0,
      //   id: 1,
      //   content:
      //     "Saya kira hanya iming-iming saja pengirimannya akan cepat, ternyata beneran secepat itu. Terimakasih Logist.",
      //   createdAt: "1 month ago",
      //   score: 12,
      //   user: {
      //     image: {
      //       png: "./images/avatars/5.png",
      //       webp: "./images/avatars/5.webp",
      //     },
      //     username: "Abraham Marco Suryadi",
      //   },
      //   replies: [
      //     {
      //       parent: 2,
      //       id: 1,
      //       content:
      //         "Benar!. saya pikir juga begitu, malah ini lebih cepat dari estimasi!",
      //       createdAt: "3 week ago",
      //       score: 4,
      //       replyingTo: "Abraham Marco Suryadi",
      //       user: {
      //         image: {
      //           png: "./images/avatars/3.png",
      //           webp: "./images/avatars/3.webp",
      //         },
      //         username: "Ines Gayatri",
      //       },
      //     },
      //   ],
      // },
      // {
      //   parent: 0,
      //   id: 2,
      //   content:
      //     "Wahhhh, ini mah lebih cepat dari kereta cepat Whoosh! Pengirimannya cepat dan sesuai!",
      //   createdAt: "2 weeks ago",
      //   score: 5,
      //   user: {
      //     image: {
      //       png: "./images/avatars/4.png",
      //       webp: "./images/avatars/4.webp",
      //     },
      //     username: "Blandina Siti",
      //   },
      //   replies: [
      //     {
      //       parent: 2,
      //       id: 1,
      //       content:
      //         "Lebih cepat dari pesawat Jett dan Roket kalau ini mah",
      //       createdAt: "1 week ago",
      //       score: 4,
      //       replyingTo: "Blandina Siti",
      //       user: {
      //         image: {
      //           png: "./images/avatars/1.png",
      //           webp: "./images/avatars/1.webp",
      //         },
      //         username: "Rizal Fanani",
      //       },
      //     },
      //     {
      //       parent: 2,
      //       id: 1,
      //       content:
      //         "Betul banget kak, pengirimannya diluar prediksi BMKG",
      //       createdAt: "2 days ago",
      //       score: 2,
      //       replyingTo: "Rizal Fanani",
      //       user: {
      //         image: {
      //           png: "./images/avatars/2.png",
      //           webp: "./images/avatars/2.webp",
      //         },
      //         username: "Vina Fariska",
      //       },
      //     },
      //   ],
      // },
    ],
  };
  function appendFrag(frag, parent) {
    var children = [].slice.call(frag.childNodes, 0);
    parent.appendChild(frag);
    return children[1];
  }
  
  const addComment = async(username, body, parentId, replyTo = undefined) => {
    await sendComment({
      username: username,
      parent: parentId,
      content: body,
      score: 0,
    });
    data.currentUser = {
      ...data.currentUser,
      username,
    };
    const result = await getData();
    initComments(result.results);
  };
  const deleteComment = async(commentObject) => {
    // if (commentObject.parent == 0) {
    //   data.comments = data.comments.filter((e) => e != commentObject);
    // } else {
    //   data.comments.filter((e) => e.id === commentObject.parent)[0].replies =
    //     data.comments
    //       .filter((e) => e.id === commentObject.parent)[0]
    //       .replies.filter((e) => e != commentObject);
    // }
    await dropComment(commentObject.id);
    const result = await getData();
    initComments(result.results);
  };
  
  const promptDel = (commentObject) => {
    const modalWrp = document.querySelector(".modal-wrp");
    modalWrp.classList.remove("invisible");
    modalWrp.querySelector(".yes").addEventListener("click", () => {
      deleteComment(commentObject);
      modalWrp.classList.add("invisible");
    });
    modalWrp.querySelector(".no").addEventListener("click", () => {
      modalWrp.classList.add("invisible");
    });
  };
  
  const spawnReplyInput = (parent, parentId, replyTo = undefined) => {
    if (parent.querySelectorAll(".reply-input")) {
      parent.querySelectorAll(".reply-input").forEach((e) => {
        e.remove();
      });
    }
    const inputTemplate = document.querySelector(".reply-input-template");
    const inputNode = inputTemplate.content.cloneNode(true);
    const addedInput = appendFrag(inputNode, parent);
    addedInput.querySelector(".bu-primary").addEventListener("click", () => {
      let commentBody = addedInput.querySelector(".cmnt-input").value;
      const username = addedInput.querySelector("#username").value;
      if (commentBody.length == 0 || username.length === 0) return;
      addComment(username, commentBody, parentId, replyTo);
    });
  };
  
  const createCommentNode = (commentObject) => {
    const commentTemplate = document.querySelector(".comment-template");
    var commentNode = commentTemplate.content.cloneNode(true);
    commentNode.querySelector(".usr-name").textContent = commentObject.username;
    commentNode.querySelector(".usr-img").src = `/images/${commentObject.image}`;
    commentNode.querySelector(".score-number").textContent = commentObject.score;
    commentNode.querySelector(".cmnt-at").textContent = commentObject.createdAt;
    commentNode.querySelector(".c-body").textContent = commentObject.content;
    if (commentObject.replyingTo)
      commentNode.querySelector(".reply-to").textContent =
        "@" + commentObject.replyingTo;
  
    commentNode.querySelector(".score-plus").addEventListener("click", () => {
      commentObject.score++;
      initComments();
    });
  
    commentNode.querySelector(".score-minus").addEventListener("click", () => {
      commentObject.score--;
      if (commentObject.score < 0) commentObject.score = 0;
      initComments();
    });
    if (commentObject.username == data.currentUser.username) {
      commentNode.querySelector(".comment").classList.add("this-user");
      commentNode.querySelector(".delete").addEventListener("click", () => {
        promptDel(commentObject);
      });
      return commentNode;
    }
    return commentNode;
  };
  
  const appendComment = (parentNode, commentNode, parentId) => {
    const bu_reply = commentNode.querySelector(".reply");
    const appendedCmnt = appendFrag(commentNode, parentNode);
    const replyTo = appendedCmnt.querySelector(".usr-name").textContent;
    bu_reply.addEventListener("click", () => {
      if (parentNode.classList.contains("replies")) {
        spawnReplyInput(parentNode, parentId, replyTo);
      } else {
        spawnReplyInput(
          appendedCmnt.querySelector(".replies"),
          parentId,
          replyTo
        );
      }
    });
  };
  
async function initComments(
    commentList = data.comments,
    parent = document.querySelector(".comments-wrp")
  ) {
      parent.innerHTML = "";
      commentList.forEach((element) => {
        var parentId = element.parent ? element.parent : element.id;
        const comment_node = createCommentNode(element);
        if (element.replies && element.replies.length > 0) {
          initComments(element.replies, comment_node.querySelector(".replies"));
        }
        appendComment(parent, comment_node, parentId);
      });
  }
  
window.addEventListener("DOMContentLoaded", async (event) => {
  const response = await getData();
  console.log(response)
  initComments(response.results);
});
  const cmntInput = document.querySelector(".reply-input");
  cmntInput.querySelector(".bu-primary").addEventListener("click", () => {
    let commentBody = cmntInput.querySelector(".cmnt-input").value;
    const username = cmntInput.querySelector("#username").value;
    if (commentBody.length == 0 || username.length === 0) return;
    addComment(username, commentBody, 0);
    cmntInput.querySelector(".cmnt-input").value = "";
    cmntInput.querySelector("#username").value = "";
  });
  

function getData() {
  return fetch(`${BASE_URL}/comment`)
  .then(response => response.json())
  .catch((error) => error);
}

function sendComment(body) {
  return fetch(`${BASE_URL}/comment`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  .then(response => response.json())
  .catch((error) => error);
}

function dropComment(id) {
  return fetch(`${BASE_URL}/comment/${id}`,{
    method: 'DELETE',
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then(response => response.json())
  .catch((error) => error);
}