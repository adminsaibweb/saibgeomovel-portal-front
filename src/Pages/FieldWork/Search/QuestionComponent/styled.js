import styled from 'styled-components';

export const ContentHeaderCollaPsible = styled.div`
  background-color: ${(props) =>
    props.backColor === undefined ? '#8e44ad' : props.backColor};
  display: flex;
  justify-content: space-between !important;
  width: 100%;
  div {
    display: flex;
    align-items: center;
  }
  i {
    margin: 0 !important;
    color: #fff !important;
  }
  #Dropdown_6 {
    max-width: 40%;
    li {
      max-height: max-content;
    }
  }
`;

export const OptionsSelect = styled.select`
  display: ${(props) => (props.showOption === true ? 'block' : 'none')};
  background-color: ${(props) =>
    props.optionSelected === true ? '#7e3a9d' : '#fff'};
`;

export const ContentCheckBox = styled.div`
  /* display: flex; */
  display: ${(props) =>
    props.displayNone === true || props.displayNone === undefined
      ? 'none'
      : 'flex'};
  padding: 0 10px;
  align-items: center;
  justify-content: space-between;
  background: ${(props) => (props.isPurple ? '#f4eaf9' : '#fff')};
  span {
    color: #000;
  }
  padding: 10px;
`;
