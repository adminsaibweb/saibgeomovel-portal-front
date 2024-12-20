import styled from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  width: calc(100vw - 60px);

  transition-delay: 2s;
  scroll-behavior: smooth;
  /* overflow-y: hidden; */
  @media (min-width: 769px) {
    margin-left: 60px !important;
  }
  @media (max-width: 768px) {
    width: 100vw;
  }
  .primeiraLinha {
    /* margin-top: 10px; */
    padding-top: 10px;
  }
`;

export const ContainerInterno = styled.div`
  background-color: #fff;
  margin: 10px;
  /* height: 100vh; */
  overflow-y: auto;
  /* width: calc(100vw - 60px); */
  @media (min-width: 769px) {
    /* margin-left: 60px !important; */
  }
  @media (max-width: 768px) {
    width: 100vw;
    max-width: calc(100% - 20px);
    /* margin: 0 !important; */
  }
  .primeiraLinha {
    /* margin-top: 10px; */
  }

  div.containerQuestion {
    margin: 0;
    padding: 0;
    @media (max-width: 768px) {
      display: flex;
      flex-direction: ${(props) =>
        props.questionTypeMoney ? 'column-reverse' : 'column'};
    }
  }
`;

export const ContentAgrupedData = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 10px 0px 10px;
  width: 100%;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0;
  }
`;
export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0px 10px 0px 10px;
  width: 100%;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 100% !important;
    margin: 0 !important;
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

export const QuestionDescription = styled.p`
  padding-right: 5px;
`;

export const ContentOrdenation = styled.div`
  display: flex;
`;

export const ContentSelectQuestionsDisponible = styled.div`
  display: ${(props) => props.visible};
  width: 30%;

  .input-field {
    width: 100% !important;
    .select-wrapper {
      width: 100% !important;
    }
  }
`;

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

export const ContenteCheckbox = styled.div`
  span {
    cursor: ${(props) =>
      props.isDisabled ? 'default !important' : 'pointer !important'};
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 10px 10px 10px;
  text-align: left;
  line-height: 0.9rem;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  span {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
  }
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
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '500' : props.fontWeight};
`;

export const UploadFile = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 8px !important;
  label {
    margin-top: 5px !important;
  }
  input[type='file'] {
    display: none;
  }
`;

export const SubTitulo = styled.h6`
  display: flex;
  align-items: center;
  color: #666666;
  font-weight: 600 !important;
  padding-bottom: 0px;
  margin: 10px 0 0 0;
`;
