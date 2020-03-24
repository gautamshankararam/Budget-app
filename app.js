//module 1(budget controller)
var budgetController= (function(){
    
    var Expense =function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage = -1;
        
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0){
            this.percentage  = Math.round((this.value/totalIncome)*100);      
        }  
        else{
            this.percentage = -1;
        }
         
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    var Income =function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;    
    };
    
    var data ={
        allitems :{
            exp:[],
            inc:[]
        },
        totals: {
            exp:0,
            inc:0
        },
        budget : 0,
        percentage : -1
    };
    
    var CalculateTotal =function(type){
        var sum=0;
        data.allitems[type].forEach(function(cur){
            sum+=cur.value;
        });
        data.totals[type]=sum;
    };
    
    return{
        additem: function(type,des,value){
        var newItem,ID;
        if(data.allitems[type].length>0){
            ID=data.allitems[type][data.allitems[type].length-1].id+1;
        }else{
            ID=0;
        }
        if(type==='exp'){
           newItem=new Expense(ID,des,value);    
        }
        else if(type === 'inc'){
           newItem=new Income(ID,des,value);  
         }
            data.allitems[type].push(newItem);
            return newItem;
        },
        
        calculateBudget : function(){
            CalculateTotal('inc');
            CalculateTotal('exp');
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            }else{
                data.percentage = -1;
            }
        },
        
        calculatePercentages : function(){
            data.allitems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages : function(){
          var allperc = data.allitems.exp.map(function(cur){
             return cur.getPercentage(); 
          });
          return allperc;
        },
        
        getBudget : function(){
            return {
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            };
        },
        
        deleteItem : function(type,id){
            var ids,index;
            
            ids = data.allitems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allitems[type].splice(index,1);
            }    
        }
    };
    
})();





//module 2(UIcontroller)
var UIController= (function(){
    
    var DOMstrings={
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel : '.budget__title--month'
    };
    
    var formatNumber = function(num,type){
            var numSplit,int,dec;
            
            num=Math.abs(num);
            num=num.toFixed(2);
            
            numSplit = num.split('.');
            int =  numSplit[0];
            
            if(int.length>3){
                
                int.substr(0,int.length-3) + ','+ int.substr(int.length-3,3);
            }
            
            dec = numSplit[1];

            return (type === 'exp' ?  '-' :  '+') + ' ' + int +'.'+ dec;
        };
    
     var nodeListForEach = function(list,callack){
                for(var i=0;i<list.length;i++){
                    callack(list[i],i);
                }
        };
            
    
    return{
        getInput : function(){
            return{
                type : document.querySelector(DOMstrings.inputType).value, //it will be either inc or exp
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem : function(obj,type){
            var html,newhtml,element;
            
            if(type==='inc'){
            element=DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            else if(type==='exp'){
            element=DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newhtml = html.replace('%id%',obj.id);
            newhtml = newhtml.replace('%description%',obj.description);
            newhtml = newhtml.replace('%value%',formatNumber(obj.value,type));
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
        },
        
        deleteListItem : function(SelectorId){
            var el;
            el=document.getElementById(SelectorId);
            el.parentNode.removeChild(el);
        },
        
        getDOMstrings : function(){
            return DOMstrings;
        },
        
        clearFields : function(){
            var fields,fieldsArr; 
            fields =document.querySelectorAll(DOMstrings.inputDescription +',' +DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value="";
            });
            fieldsArr[0].focus();
        },
        
        displayBudget : function(obj){
            var type;
            obj.budget>0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalExp,'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage + '%';             
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent='---';
            }
                
        },
        
        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
           
            nodeListForEach(fields,function (current,index){
                if(percentages[index]>0){
                   current.textContent = percentages[index]  + '%';    
                }else{
                    current.textContent = '---';
                }
            });
                
        },
        
        displayMonth : function(){
            var now,year,month,months;
            months =['Jan','Feb','Mar','Apr','May','June','July','Aug','Sep','Oct','Nov','Dec'];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' +year ;

        },
        
        changeType : function(){
            var fields
            fields = document.querySelectorAll(DOMstrings.inputType +  ',' + DOMstrings.inputDescription+ ',' +DOMstrings.inputValue);
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        }
        
        
    };
    
})();






//module-3(appcontroller)
var appController= (function(budgetctrl,UIctrl){
    
    var setupEventListeners=function(){
        var DOM = UIctrl.getDOMstrings();
        
        document.querySelector(DOM.inputButton).addEventListener('click',ctrladditem);
    
        document.addEventListener('keypress',function(event){ 
            if(event.keyCode===13){
               ctrladditem();    
            }        
         });
        
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UIctrl.changeType);
    };
    
    
    var updateBudget = function(){
        var budget;
        
        //1.calculate the budget
        budgetctrl.calculateBudget();
        
        //2.Return the budget
        budget = budgetctrl.getBudget();
        
        //3.updae budget in UI
        UIctrl.displayBudget(budget);
    };
    
    var updatePercentages = function(){
        
        //1.calculate percentage
        budgetctrl.calculatePercentages();
        
        //2.read percentages
        var percentages = budgetctrl.getPercentages();
        
        //3.update UI
        UIctrl.displayPercentages(percentages);
    };
    
    
    
    var ctrladditem = function(){
        var input,newItem;
        
        //1.Get the input field data
        input  = UIctrl.getInput();
        
        
        if(input.description!== "" && !isNaN(input.value) && input.value>0){
            
            //2.Add the item to the budget controller
            newItem = budgetctrl.additem(input.type,input.description,input.value);
        
            //3.Add the item to the UI
            UIctrl.addListItem(newItem,input.type);
        
            //4.Clear the input fields
            UIctrl.clearFields();
        
            //5.calculate and update budget
            updateBudget();
            
            //6.calculate and update percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event){
        var itemId,splitId,type,Id;
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            Id = parseInt(splitId[1]);   
            
            //1.delete the item from the datastructure
            budgetctrl.deleteItem(type,Id);
            
            //2.delete the item from the UI
            UIctrl.deleteListItem(itemId);
            
            //3.update and show the new budget 
            updateBudget();
            
            //4.calculate and update percentages
            updatePercentages();
        }
    }; 
    
    return{
       init: function(){
           UIctrl.displayBudget({
               budget:0,
               totalInc:0,
               totalExp:0,
               percentage:-1
           });
           setupEventListeners();  
           UIctrl.displayMonth();
       }
    };
    

    
})(budgetController,UIController);

appController.init();