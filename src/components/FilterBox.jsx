import React, {useState, useContext, useReducer} from 'react'
import { FinderFilterContext } from '../helpers/FinderFilterContext.js'

const initialState = {
  custom_checkbox_0: true,
  custom_checkbox_1: true,
  custom_checkbox_2: true,
  custom_checkbox_3: true,
  custom_checkbox_4: true,
  custom_checkbox_5: true,
};
function reducer(state, action) {
  switch (action.type) {
    case "custom_checkbox_0":
      //de estar seleccionado low-price se desactivan higth-price y closest
      return {
        ...state,
                custom_checkbox_1: !state.custom_checkbox_1,
                custom_checkbox_2: !state.custom_checkbox_2
      };
      case "custom_checkbox_1":
      //de estar seleccionado higth-price se desactivan low-price y closest
      return {
        ...state,
               custom_checkbox_0: !state.custom_checkbox_0,
               custom_checkbox_2: !state.custom_checkbox_2
      };
      case "custom_checkbox_2":
      //de estar seleccionado closest se desactivan low-price y higth-price
      return {
        ...state,
               custom_checkbox_0: !state.custom_checkbox_0,
               custom_checkbox_1: !state.custom_checkbox_1
      };
    default:
      return { ...state };
  }
}


 export default function FilterBox(){
    const [state, dispatch] = useReducer(reducer, initialState);
    const filters = ['low price','high price','closest to me','soon','translator from English','JCI international accreditation'];
    const { filterMode, setFilterMode } = useContext( FinderFilterContext );

    const [checkedState, setCheckedState] = useState(new Array(filters.length).fill(false));

    const handleOnChange = (event, position) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item
        );
       dispatch({ type: `custom_checkbox_${position}` })
       setCheckedState(updatedCheckedState);
        //const newFilterMode = filters.filter((_, index) => updatedCheckedState[index]);
       setFilterMode(event.target.value);
        const selectedValue = event.target.value;
       console.log( filterMode );
    };

    return(
        <form id='modal-filter'>
            <div className="finding-filter-wrapper" style={{
                position: 'absolute',
                width: '339px',
                background: '#F0EFEE',
                borderRadius: '14px',
                zIndex: '3',
                top: '0.2rem',
            }}>
                <ul className="finding-filter">
                    {filters.map((name, index) => {
                        return (
                            <li key={index} style={{
                                listStyleType: 'none'
                            }}>
                                <div className="finding-filter-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingBottom: '5px',
                                    gap: '10px',

                                }}>
                                    <div className="left-section" style={{
                                        width: '300px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        //marginLeft: '5px',
                                    }}>
                                        <label htmlFor={`custom_checkbox_${index}`}  className="label-custom_checkbox_"
                                               style={{
                                                   fontFamily: 'Fira Sans Extra Condensed',
                                                   fontStyle: 'normal',
                                                   fontWeight: '400',
                                                   fontSize: '20px',
                                                   lineHeight: '28px',
                                               }}>{name}</label>
                                    </div>
                                    <div className="right-section"
                                         style={{
                                             width: '20px',
                                             height: '25px',
                                             marginRight: '15px',
                                         }}>
                                        <input
                                            type="checkbox"
                                            id={`custom_checkbox_${index}`}
                                            name='checkbox'
                                            value={filters[index]}
                                            checked={checkedState[index]}
                                            disabled={!state[`custom_checkbox_${index}`]}
                                            onClick={(event) => { event.stopPropagation() }}
                                            onChange={(event) => { handleOnChange(event, index)

                                          }}
                                            className="input-custom_checkbox_"
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                marginRight: '15px',
                                            }}
                                        />
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </form>
    );
}