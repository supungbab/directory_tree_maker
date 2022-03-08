const fs = require('fs');
const { argv } = require('process');

/**
 * fs 를 통해 폴더 내 파일을 객체 배열로 만드는 함수
 * @param {String} dir 폴더 주소
 * @param {Array} exception 제외할 폴더 및 배열
 * @param {Boolean} all 폴더 내 파일까지 가지고 올지 여부
 * @param {Array} files_ 데이터가 저장 될 변수
 * @param {String} origin 기본 Origin 주소
 * @returns 
 */
const getFiles = (dir, exception, all, files_, origin) => {
  let files = fs.readdirSync(dir);
  for (let i in files){
    let name = dir + '/' + files[i];
    const path = name.replace(origin+'/', '');
    if(!exception.includes(files[i])){
      if (fs.statSync(name).isDirectory()){
        files_.push({type:'tree', text:files[i], path});
        getFiles(name, exception, all, files_,origin);
      } else if (all){
        files_.push({type:'blob', text:files[i], path});
      }
    }
  }
  return files_;
}

/**
 * 포맷 형식의 맞는 객체를 넣을 시 String 형태의 Tree 문자열을 반환
 * {
 *  폴더명1:{
 *    파일명1: {type:'file'},
 *    파일명2: {type:'file'},
 *  },
 *  폴더명2:{
 *    파일명1: {type:'file'},
 *    파일명2: {type:'file'},
 *  },
 *  파일명1: {type:'file'},
 *  파일명2: {type:'file'},
 * } 
 * @param {Object} tree 객체 배열을 가공한 객체를 넣는다.
 * @returns 
 */
const treeCreate = (tree) => {
  let text = '';
  const recursionFolder = (tree, branchArray) => {
    const keys = Object.keys(tree);
    let count = keys.length;
    
    keys.forEach(key => {
      branchArray.forEach(e => {
        if(e>1) text+=' ┃  ';
        if(e===1) text+='    ';
      })
      if(count>1) text+= ' ┣━';
      if(count===1) text+= ' ┗━'
      if(tree[key].type === 'file'){
        text+=` 📜 ${key}\n`;
      } else{
        text+=` 📂 ${key}\n`;
        recursionFolder(tree[key], [...branchArray, count]);
      }
      
      count--;
    })
  }
  recursionFolder(tree, []);
  return text;
}

/**
 * 객체 배열을 가공하여 객체로 만든다.
 * @param {Array} tree 객체 배열
 * @returns
 * {
 *  폴더명1:{
 *    파일명1: {type:'file'},
 *    파일명2: {type:'file'},
 *  },
 *  폴더명2:{
 *    파일명1: {type:'file'},
 *    파일명2: {type:'file'},
 *  },
 *  파일명1: {type:'file'},
 *  파일명2: {type:'file'},
 * } 
 */
const treeObjectCreate = (tree) => {
  const treeObject = [];
  tree.forEach(e => {
    const {type, path} = e;
    let pivot = treeObject;
    if(type === 'tree'){
      const folder = path.split('/');
      folder.forEach(e => {
        pivot[e] = pivot[e] || {};
        pivot = pivot[e];
      });
    } else {
      const folder = path.split('/');
      const file = folder.pop();
      folder.forEach(e => {
        pivot = pivot[e];
      });
      pivot[file] = {type:'file'};
    }
  })
  return treeObject;
}

/**
 * 트리를 생성 하는 함수
 * ex) getTree(경로, 저장경로, 제외배열 = [], 전체 여부 = true)
 * @param {String} folder Tree 를 그릴 경로
 * @param {String} savePath 저장 경로 'C:/test/tset.txt' or 'test.txt' 절대 경로 or 상대 경로
 * @param {Array} exception 제외할 폴더 or 파일이 담긴 배열
 * @param {Boolean} all 폴더 내 파일까지 그릴지 여부
 */
const getTree = (folder = __dirname, {savePath = 'Tree.txt', exception = [], all = true} = {}) => {
  if (!savePath.includes(':')){
    savePath = `./${savePath}`;
  }
  console.log(process.argv);
  const fileArray = getFiles(folder,exception,all,[],folder);
  // 문자 내 포함되어 있는 숫자기준 정렬
  fileArray.sort((a, b) => {
    let aNumber = a.text.match(/(\d+)/g);
    aNumber = aNumber ? Number(aNumber[0]) : 0;
    let bNumber = b.text.match(/(\d+)/g);
    bNumber = bNumber ? Number(bNumber[0]) : 0;
    return aNumber - bNumber
  });
  // 폴더 정렬
  fileArray.sort((a, b) => {
    if (a.type < b.type) {
      return 1;
    }
    if (a.type > b.type) {
      return -1;
    }
    // 이름이 같을 경우
    return 0;
  })
  const treeObject = treeObjectCreate(fileArray);

  // 파일 배출 뿡!
  fs.writeFile(savePath, treeCreate(treeObject, []), (err) => {
    if(err){
      console.log(err);
    }
    console.log('성공');
  })
}
console.log(process.argv);
// (async ()=> {
//   // console.log(getTree('C:/Users/BALAAN/WebstormProjects/new-feed/shops', {}));
// })();