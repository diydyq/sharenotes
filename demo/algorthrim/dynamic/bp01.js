/**
 * @file 01背包问题
 *
 */


function backpack01(count, maxSize, dataList){

    console.info('Backpack: ', count, maxSize);

    if(count === 1){
        var pos = null;
        dataList.forEach(function (dataItem, dataIdx) {
            if(dataItem.size <= maxSize){
                // 取符合的第0个元素
                dataIdx === 0 && (pos = dataItem);

                if(dataItem.value > pos.value){
                    pos = dataItem;
                }
            }
        });
        if(pos){
            console.info('OnlyOne: ', pos.value);
        }
        return (pos || {}).value || 0;
    }


    var dataItem = dataList.shift();

    var opn1 = backpack01(count - 1, maxSize - dataItem.size, dataList.concat()) + dataItem.value;
    var opn2 = backpack01(count - 1, maxSize, dataList.concat());

    if(opn1 > opn2){
        console.info('Choose: ', dataItem.value);
        return opn1;
    }else{
        return opn2
    }
}


var case01 = [
    { size: 3, value: 10 },
    { size: 4, value: 12 },
    { size: 5, value: 20 },
];


console.info('FinalMaxValue: ', backpack01(case01.length, 10, case01));


