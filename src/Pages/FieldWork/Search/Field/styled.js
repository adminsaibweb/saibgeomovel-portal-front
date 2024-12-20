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

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 10px 10px 10px;
  text-align: left;
  line-height: 0.9rem;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  /* margin: 0px 5px 0px 5px; */
  @media (max-width: 768px) {
    padding-top: 0px;
  }
  div > .input-field.col {
    margin-top: 0px !important;
  }
  select {
    display: block !important;
  }
  button {
    margin-bottom: 10px !important;
  }
`;
