const delay = (s) => {
    return new Promise(resolve => {
      setTimeout(resolve,s); 
    });
  };
  
  delay().then(() => {
    console.log(1);     // 顯示 1
    return delay(1000); // 延遲ㄧ秒
  }).then(() => {
    console.log(2);     // 顯示 2
    return delay(2000); // 延遲二秒
  }).then(() => {
    console.log(3);     // 顯示 3
  });