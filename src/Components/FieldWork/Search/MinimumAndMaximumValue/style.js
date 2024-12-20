import styled from 'styled-components';

export const ContainerInterno = styled.div`
  background-color: #fff;
  margin: 0 5px 10px;

  /* height: 100vh; */
  border-radius: 5px;
  /* border: 1px solid #bd207b; */
  /* padding-top: 10px;
  padding-bottom: 10px; */
  /* padding: 10px; */

  overflow-y: auto;
  flex: 1;
  /* width: 0%; */
  @media (max-width: 1400px) {
    flex: 1;
    /* margin-left: 60px !important; */
  }
  @media (max-width: 1100px) {
    flex: 1;

    /* margin-left: 60px !important; */
  }
  @media (max-width: 768px) {
    width: 100vw;
    margin: 0 0 10px 15px;

    margin: 10px auto !important;
    max-width: calc(100% - 20px);

    div.lineDetails {
      padding: 0;
    }
    /* margin: 0 !important; */
  }
  .primeiraLinha {
    margin-top: 10px;
  }
  .lineDetails {
    margin-top: 20px;
  }
`;

export const EachIcon = styled.div`
  i {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
    color: ${(props) => (props.isDisabled ? '#bd207b5e' : '#bd207b')};
  }
`;

export const ContentIconsItemList = styled.div`
  display: flex;
`;

export const Button = styled.button`
  background-color: ${(props) =>
    props.disabled ? '#bd207b5e !important' : '#bd207b !important'};
  border: ${(props) =>
    props.disabled ? '#bd207b5e !important' : '#bd207b !important'};
  color: #fff !important;
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  /* padding: 0px 10px 0px 10px; */
  text-align: left;
  line-height: 0.9rem;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  span {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
  }

  @media (max-width: 768px) {
    /* padding-top: 0px; */
    button {
      width: 100%;
    }
  }
  div > .input-field.col {
    margin-top: 0px !important;
  }
  select {
    display: block !important;
  }
  button {
    margin: 2px;
    /* margin-bottom: 10px !important; */
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const Labels = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '500' : props.fontWeight};
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  /* padding: 0px 10px 0px 10px; */
  width: 100%;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    padding: 10px;
    flex-direction: column;
    max-width: 100% !important;
    margin: 0 !important;
  }

  div.detail1 {
    padding-right: 10px;
    padding-left: 5px;
    @media (max-width: 768px) {
      padding: 0;
    }
  }
  div.detail2 {
    padding-left: 10px;
    padding-right: 5px;
    @media (max-width: 768px) {
      padding: 0;
    }
  }

  div.detailsButton {
    max-width: 200px;
  }
  .collapsible-header {
    padding-bottom: 4px;
    border-bottom: unset;
    background-color: white;
    color: #858585;
    font-weight: 500;
    text-transform: capitalize;
    /* border: 1px solid #ccc; */
    border-radius: 2px;
    /* box-shadow: -1px 1px 5px 1px rgba(0,0,0,0.1); */
    padding: 0px !important;
    .minus,
    .plus {
      padding: 5px;
    }
  }
  .collapsible-body {
    padding: 0px;
    margin-bottom: 10px;
    border-width: 1px 0px 1px 0px;
    border-style: solid;
    border-color: #ccc;
  }
  .collapsible {
    box-shadow: unset !important;
    /* padding: unset !important; */
    margin-bottom: 0px !important;
    margin-top: 0px !important;
  }
  .collapsible-header {
    background-color: #8e44ad;
    padding-bottom: 5px;
    color: white;
    font-weight: 700;
    font-size: 01rem;
  }
  .contentSubTitle {
    padding-left: 0 !important;
  }
`;
