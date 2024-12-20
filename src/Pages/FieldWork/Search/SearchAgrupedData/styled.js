import styled from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  /* height: 100vh;
  overflow-y: auto;
  width: calc(100vw - 60px); */
  border: 1px solid #c2c2c2;
  border-radius: 5px;
  margin: 10px 10px 0;
  @media (min-width: 769px) {
    /* margin-left: 60px !important; */
  }
  @media (max-width: 768px) {
    /* width: 100vw; */
  }
  label.labelHeaderAgruped {
    margin: 10px 10px 10px 10px !important;
  }
  button.saib2:hover {
    background-color: #d91487 !important;
    border-color: #d91487 !important;
  }
`;

export const IconContainer = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`;

export const EachItemModal = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 10px;
  /* border-bottom: 1px dashed #c2c2c2; */
  i {
    color: #8e44ad;
  }
  > div {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
`;
export const ContentItemsInModal = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0.3rem;
`;

export const ContentModal = styled.div`
  .modal {
    width: 80% !important;
  }

  .modal-footer {
    button {
      background-color: #bd207b !important;
      border-color: #bd207b !important;
    }
  }
`;
export const ContentHeaderModal = styled.div`
  background: #7e3a9d;
`;
export const ContentBodyModal = styled.div`
  // background: #7e3a9d;
  border: 1px solid #c2c2c2;
  border-radius: 5px;
`;
export const ContentAgroupeds = styled.div`
  display: flex;
  /* flex-direction: column; */
  flex-wrap: wrap;
  padding: 0 10px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

export const ContentDescriptionAgrouped = styled.div`
  max-width: inherit;
  width: inherit;
`;

export const ContentAgrouped = styled.div`
  max-width: 250px;
  width: 250px;
  border: 1px solid #c2c2c2;
  border-radius: 5px;
  padding: 5px;
  margin: 5px;
  margin-bottom: 5px;
  @media (max-width: 768px) {
    /* /* max-width: max-content; */
    margin-left: 0 !important;
    margin-right: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  p {
    font-weight: 700;
    color: #737373;
    width: auto;
    text-align: center;
  }
`;

export const LinhaTitleItensAgrupamento = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 10px;

  label {
    color: #8e44ad;
    font-size: 1.2rem;
    width: 100%;
    text-align: center;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: ${(props) =>
    props.justifyLeft ? 'flex-start' : 'flex-end'};
  .waves-effect waves-light saib-button {
  }
  /* padding: 0px 10px 0px 10px; */
  width: 100%;
  border-bottom: ${(props) =>
    props.addRowBottom ? '1px solid rgba(194, 194, 194, 0.5)' : 'unset'};
  /* flex: 1; */
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 100% !important;
    margin: 0 !important;
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

export const ContentInputs = styled.div`
  display: flex;
  width: 100%;
`;

export const ContentBtnAddNewAgrouped = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 10px 10px 0;
  /* margin-top: 30px; */
  text-align: left;
  line-height: 0.9rem;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  /* margin: 0px 5px 0px 5px; */

  button.saib2 {
    background-color: #bd207b !important;
    border-color: #bd207b !important;
  }
  button.saib2:hover {
    background-color: #d91487 !important;
    border-color: #d91487 !important;
  }

  @media (max-width: 768px) {
    padding-top: 0px;
    button {
      margin: 10px;
      width: max-content;
    }
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 10px 10px 10px;

  text-align: left;
  line-height: 0.9rem;
  width: ${(props) => (props.maxWidth !== undefined ? '100%' : 'unset')};
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  /* margin: 0px 5px 0px 5px; */
  @media (max-width: 768px) {
    /* padding-top: 0px; */
    button {
      width: 100%;
    }
  }
  button.saib2 {
    background-color: #bd207b !important;
    border-color: #bd207b !important;
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

  label {
    /* padding-left: 3px; */
  }
`;
