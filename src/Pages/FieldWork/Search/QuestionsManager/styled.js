import styled from 'styled-components';

export const QuestionDescription = styled.p`
  padding-right: 5px;
  text-transform: uppercase !important;
  word-wrap: break-word;
  overflow: hidden;
  max-width: 63%;
`;

export const ContainerCollapsibleAndBtns = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
export const ContainerParagrapghs = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;

  @media (max-width: 768px) {
    width: 88% !important;
  }
`;

export const QuestionPosition = styled.p`
  padding-right: 5px;
  text-transform: uppercase !important;
  /* word-wrap: break-word;
  overflow: hidden;
  max-width: 73%; */
`;

export const ContentOrdenation = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 5px 0 5px !important;
  i {
    cursor: ${(props) => (props.disabled ? 'unset !important' : 'pointer')};
    color: ${(props) => (props.disabled ? '#9F9F9F !important' : '#8e44ad')};
  }
  .arrows {
    display: ${(props) => (props.displayNone === true || props.displayNone === undefined ? 'none' : 'block')};
  }
  @media (max-width: 768px) {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 10px 0 10px;
  }
`;

export const LinhaRodape = styled.div`
  border: 1px solid blue;

  display: flex;
  justify-content: flex-start;
  padding-top: 20px;
  background-color: white;
  border-color: #ccc;
  border-style: solid;
  border-width: 1px 0px 0px 0px;
  margin: 20px 10px 0px 10px;
  background-color: white;
  padding-bottom: 10px;

  width: 100%;
  /* position: absolute;
  bottom: 10%;
  right: 2%;
  width: 100%; */
`;
export const DivRodape = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
  width: 100%;

  button {
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    /* width: 10% !impo'rtant; */
    min-width: max-content !important;
  }

  button.delete {
    margin-right: 10px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    button {
      margin-left: 0 !important;
      padding-left: 10 !important;
      margin-top: 8px !important;
      margin-bottom: 10px !important;
      justify-content: space-between;

      width: 100% !important;
    }
  }
`;

export const ContentCollapsible = styled.div`
  width: 100%;
  .collapsible-header {
    align-items: center;
  }
`;
