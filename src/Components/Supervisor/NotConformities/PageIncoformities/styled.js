import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  padding: 0 10px;
  flex-wrap: wrap;

  label {
    margin-left: 10px;
  }
`;
export const LinhaCards = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  overflow-y: auto;
  label {
    margin-top: 10px;
  }

  div.contentCard {
    display: flex;
    margin-left: 10px;
    @media (max-width: 768px) {
      margin-left: 0 !important;
    }
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;

  div.contentButtons {
    padding-left: 5px;
    display: flex;
    @media (max-width: 768px) {
      width: 100%;
    }
    width: 20%;
    height: max-content;

    button {
      display: flex !important;
      align-items: center !important;
      justify-content: space-evenly;
      margin: 5px;
      width: 100%;
    }
  }

  label.labelCounter {
    margin-left: 5px !important;
    margin-top: 0.1em;
  }

  div {
    button {
      min-width: max-content;
    }
  }
`;
