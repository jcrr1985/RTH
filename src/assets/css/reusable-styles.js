//RegisterForm
export const reusable_classes = {
wrapper_top: {
    width: '81.246007326vw !important',
    margin: '0 auto',
},
center: {
    display: 'flex',
    justifyContent: 'center',
},
form_base : {
    marginBottom: '13.698630137vh',
    // el valor de width segun el figma debería ser 53.47985348vw
    width: '46.961vw',
    height: '65.753424658vh',
    padding: '1.369863014vh 0.732600733vw',
    backgroundColor: 'transparent',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  },
inline_line : {
    width: '46.961vw',
    display: 'inline-flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4vh',
},
link_enter_page : {
    margin: '0px',
    padding: '0px',
    height: '4.109589041vh',
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '1.831501832vw',
    lineHeight: '4.109589041vh',
},
link : {
    alignSelf: 'flex-end',
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '1.831501832vw',
    lineHeight: '1.831501832vh',
    color: '#5c85c6',
  },
form_content : {

    display: 'flex',
    flexFlow: 'column wrap',
    alignContent: 'flex-start',
    margin: '0px',
    height: 'auto',
    background: 'transparent',
    // gap: '0.5vw',
},
legent : {
    height: '4.794520548vh',
    alignSelf: 'center',
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '2.197802198vw',
    lineHeight: '4.794520548vh',
    margin: '0px',
    padding: '0px',
},
label : {
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '1.831501832vw',
    lineHeight: '4,109589041vh',
    padding: '1.369863014vh 9.89010989vw 0vh 0.732600733vw',
     height: '4.109589041vh',
},
input : {
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '1.831501832vw',
    lineHeight: '4.109589041vh',
    height: '7.671232877vh',
    border: '0',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '14px',
    padding: '1.369863014vh 6.080586081vw 1.369863014vh 0.732600733vw',
},
button : {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: '1.369863014vh 0.732600733vw',
    gap: '0.732600733vw',
    border: '0px',
    width: '16.043956044vw',
    height: '6.849315068vh',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '14px',
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '1.831501832vw',
    lineHeight: '4.109589041vh',
    background: 'transparent',
    textAlign: 'center',
    marginTop: '4.5vh',
    marginBottom: '2vh',
},
button_blue: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.369863014vh 3.663003663vw',
    gap: '1.369863014vh',
    //position: 'absolute',
    width: '11.648351648vw',
    height: '6.849315068vh',
    //segun el figma left 641
    //left: '47.47vw',
    //segun el figma left 442
    //top: '21.918vh',
    background: '#5c85c6',
    /* кнопки */
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '14px',
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '1.831501832vw',
    lineHeight: '4.109589041vh',
    color: '#333',
},
errors_span: {
    textShadow: 'red 0px 0px 2px',
    // color: 'yellow',
    outline: 'solid 1px red',
    borderRadius: '3px',
    padding: '2px 5px',
    margin: '4px 0px',
    // background: '#2ACB91'
},
strongPass: {
    width: "100px",
    height: "5px",
    marginLeft: "5px",
    background: "green"
},
mediumPass: {
    width: "100px",
    height: "5px",
    marginLeft: "5px",
    background: "orange"
},
weakPass: {
    width: "100px",
    height: "5px",
    marginLeft: "5px",
    background: "red"
}
};

export const onboarding = {
    icons:{
        width: '103.821vw',
        height: '8.108108108vh',
        position: 'relative',
        top: '3.324vh',
        left: '6.905vw',
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '3.029304029vw'
   },
    header_info:{
        boxSizing: 'border-box',
        // margin: '0',
        width: '39.56043956vw',
        height: '16.438356164vh',
        fontFamily: 'Fira Sans Extra Condensed',
        fontStyle: 'normal',
        fontWeight: '400',
        fontSize: '1.831501832vw',
        lineHeight: '4.109589041vh',
        color: '#000000',
       },
};

export const infoHeader = {
arrow:{
    position: 'relative',
    width: '2.637362637vw',
    height: '0.074324324vh',
    left: '89.816849817vw',
    top: '5.135135135vh',
    margin: '0px'
},
wrapper:{
    marginTop: '11.081081081vh',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: '0px'
},
info_header_wrapper:{
    display: 'flex',
    flexFlow: 'column wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '0vh',
    margin: '0px'
    //alignContent: 'space-between',
},
info_main_wrapper:{
    left: '14.542124542vw',
    display: 'flex',
    flexFlow: 'column wrap',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0px',
    marginTop: '3vh'
},
main_row:{
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: '6.446886447vw',
    margin: '0px'
},
main_content:{
    width: '25.641025641vw',
    display: 'flex',
    flexFlow: 'column wrap',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0px'
},
h1:{
    width: '79.289377289vw',
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '5.128205128vw',
    lineHeight: '6.756756757vh',
    color: '#333',
    marginBottom: '3vh'
},
h2:{
    width: '67.326007326vw',
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '2.197802198vw',
    lineHeight: '4.72972973vh',
    color: '#333',
    margin: '0px',
    marginTop: '3vh'
},
title:{
    width: '12.893772894vw',
    height: '4.054054054vh',
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '1.831501832vw',
    lineHeight: '4.054054054vh',
    color: '#333',
    margin: '0px'
},
content:{
    width: '25.641025641vw',
    fontFamily: 'Fira Sans Extra Condensed',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '1.465201465vw',
    lineHeight: '3.378378378vh',
    color: '#333',
    margin: '0px'
},
};