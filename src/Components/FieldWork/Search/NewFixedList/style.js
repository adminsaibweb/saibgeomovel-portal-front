import styled from 'styled-components';

export const ContainerInterno = styled.div`
  background-color: #fff;
  margin: 10px 10px;
  /* height: 100vh; */
  border-radius: 5px;
  border: 1px solid #bd207b;
  /* padding-top: 10px; */
  /* padding-bottom: 10px; */

  overflow-y: auto;
  width: 60%;
  overflow-y: hidden;
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
    margin: 10px auto !important;
    max-width: calc(100% - 20px);
    /* margin: 0 !important; */
  }
  .primeiraLinha {
    margin-top: 10px;
  }
  .lineDetails {
    margin-top: 20px;
  }
`;

export const ContentItems = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* padding: 0px 10px 0px 10px; */

  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  span {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
  }
  i {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
  }
  @media (max-width: 768px) {
    /* padding-top: 0px; */
    button {
      width: 100%;
    }
  }
  ul {
    display: flex;
    flex-direction: column;
    padding: 0 10px;

    li {
      display: flex;
      flex-wrap: wrap;
      flex: 1;
      border-bottom: 1px solid #c2c2c2;
      justify-content: space-between;
      align-items: center;
      line-height: 2rem;
      label {
        font-weight: 500;
        text-transform: uppercase;
        font-size: 1rem;
        color: #000;
        width: auto;
        word-wrap: break-word;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      > div {
        @media (max-width: 768px) {
          width: 100%;
        }
      }
      div {
        cursor: pointer;
        display: flex;
        color: #bd207b;
      }
    }
  }
`;

export const HeaderList = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  background: #bd207b0d;
  line-height: 2.3rem;
  padding: 0 10px;
  margin-bottom: 10px;
  label {
    color: #bd207b;
  }

  div {
    cursor: pointer;
    color: #bd207b;
  }
`;

export const EachIcon = styled.div`
  display: flex;
  align-items: center;
  i {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
    color: ${(props) => (props.isDisabled ? '#c2c2c2' : '#bd207b')};
  }
`;

export const ContentIconsItemList = styled.div`
  display: flex;

  @media (max-width: 720px) {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
`;

export const Button = styled.button`
  background-color: ${(props) => (props.disabled ? '#bd207b5e !important' : '#bd207b !important')};
  border: ${(props) => (props.disabled ? '#bd207b5e !important' : '#bd207b !important')};
  color: #fff !important;
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 10px 0px 10px;
  text-align: left;
  line-height: 0.9rem;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  span {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
  }

  /* min-width: 200px; */

  /* button.waves-effect waves-light saib-button.is-primary {
    background-color: #bd207b !important;
    border: 1px solid #bd207b !important;
  } */

  /* margin: 0px 5px 0px 5px; */
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
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '500' : props.fontWeight)};
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  /* padding: 0px 10px 0px 10px; */
  width: 100%;
  flex-wrap: wrap;
  /* height: 90%; */
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 100% !important;
    margin: 0 !important;
  }

  div.detailsButton {
    max-width: 200px;
    @media (max-width: 720px) {
      max-width: unset;
    }
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
