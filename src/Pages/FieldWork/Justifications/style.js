import styled from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  width: calc(100vw - 60px);
  @media (min-width: 769px) {
    margin-left: 60px !important;
  }
  @media (max-width: 768px) {
    width: 100vw;
  }
  .filter {
    margin-top: 10px;
  }
`;
export const RowFilter = styled.div`
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;

  margin-bottom: 15px;
  .filterTypeSearch,
  .filterSituationSearch {
    padding: 0 5px 5px 5px;
    font-weight: 700;
  }
`;

export const ContentCard = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  justify-content: space-between;

  min-width: 250px;
  max-width: 250px;
  box-shadow: rgb(0 0 0 / 10%) -1px 1px 5px 1px;
  /* border: 1px solid #8e44ad; */
  height: 150px;
  border-radius: 10px;
  margin: 5px;

  div.contentDescricao {
    height: 100%;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .contentButtons {
    /* background: #c2c2c2; */
    padding: 10px;
  }

  label {
    display: flex;
    align-items: center;
    padding-right: 4px;

    i {
      cursor: pointer;
    }

    i.done {
      color: #8e44ad;
    }
    i.close {
      color: #ff0000;
    }
  }

  @media (max-width: 720px) {
    width: 100%;
    max-width: unset !important;
  }
`;

export const ContentItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #c2c2c2;
  border-radius: 10px;
  margin: 5px;
  padding-left: 5px;
  margin-top: 5px !important;
  div {
    label.titleItem {
      width: 100%;
      text-align: center;
    }
  }
  @media (max-width: 768px) {
    width: 100%;
    div {
      display: flex;
      justify-content: space-between;
    }
  }
`;

export const ContentDetailsItemKanban = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  margin: 10px 0;
  label {
    display: flex;
    align-items: center;
    padding-right: 4px;

    i.done {
      color: #8e44ad;
    }
    i.close {
      color: #ff0000;
    }
  }
`;

export const ContentOptionsFilter = styled.div`
  /* margin-left: 10px; */
  @media (max-width: 768px) {
    margin-left: 0 !important;
  }
  height: 100%;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  width: 100%;
  border-radius: 5px;
  /* border: 1px solid #c2c2c2; */
  label {
    text-transform: none !important;
  }
  div {
    display: flex;
    flex-wrap: wrap;
    label {
      padding-right: 5px;
    }
    div {
      width: 400px;
      display: flex;
      @media (max-width: 500px) {
        p,
        label {
          flex: unset;
        }
      }
      p,
      label {
        flex: 1;
        justify-content: space-between;
        min-width: max-content;
      }
    }
  }
  span {
    color: #858585 !important;
    font-weight: 300;
  }
  span::after {
    background-color: #8e44ad !important;
    border: 2px solid #8e44ad !important;
    color: #858585 !important;
  }
  /* min-width: 220px; */
`;
export const ContentInputFilter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-self: flex-end;
  width: 100%;
  margin-left: 5px;
  align-items: flex-end;
  margin-bottom: 0;

  input {
    margin-bottom: 0;
    margin-left: 12px;
    margin-top: 7px;
  }
  @media only screen and (max-width: 768px) {
    min-width: 100%;
    flex: 1;
  }
  min-width: 350px;
  > div {
    text-transform: none;
  }
  div.content-input {
    flex: 1;
    min-width: 250px;
    display: flex;
    align-items: center;
    margin-left: 7px;
    input {
      text-transform: capitalize !important;
    }
  }

  span {
    color: #858585 !important;
    font-weight: 300;
  }
  span::after {
    background-color: #8e44ad !important;
    border: 2px solid #8e44ad !important;
    color: #858585 !important;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0px 10px 0px 10px;
  width: 100%;
  text-transform: capitalize;
  flex-wrap: wrap;
  @media (max-width: 768px) {
  }
  .chips {
    border-bottom: 0.1px solid #9e9e9e !important;
  }
  .collapsible-header {
    padding-bottom: 4px;
    border-bottom: unset;
    background-color: white;
    color: #858585;
    font-weight: 500;
    text-transform: capitalize;
    /* border: 1px solid #ccc; */
    /* box-shadow: -1px 1px 5px 1px rgba(0,0,0,0.1); */
    padding: 0px !important;
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

  a,
  button {
    width: 100% !important;
    padding-bottom: 10px;
  }
  button {
    height: 2rem !important;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const LinhaBtnsModal = styled.div`
  /* padding: 0 5px 5px; */
  display: flex;
  a,
  button {
    flex: 1;
    width: auto !important;
    max-height: 30px;

    button {
      flex: 1;
      width: 100% !important;
    }
  }
  button.waves-effect waves-light saib-button {
    margin-left: 3px !important;
  }
  .view {
    margin-right: 3px !important;
  }
`;

export const LinhaContentHeaderKanBan = styled.div`
  display: flex;
  flex-direction: row;
  padding: 5px 10px 0px 10px;

  width: 100%;
  text-transform: capitalize;
  flex-wrap: nowrap !important;

  .collapsible-header {
    padding-bottom: 4px;
    border-bottom: unset;
    background-color: white;
    color: #858585;
    font-weight: 500;
    text-transform: capitalize;
    /* border: 1px solid #ccc; */
    /* box-shadow: -1px 1px 5px 1px rgba(0,0,0,0.1); */
    padding: 0px !important;
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

  a,
  button {
    width: 100% !important;
  }
`;

export const DivDetalhe = styled.div`
  width: ${(props) => (props.description ? '75%' : 'unset')};
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
  img {
    margin-top: 3px;
    height: 50px;
    width: 50px;
  }
`;

export const LabelsFilter = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '700' : props.fontWeight};

  width: 150px;
  min-width: 150px;
  /* overflow: hidden;
  text-overflow: ellipsis; */
  white-space: nowrap;
`;

export const LabelSituation = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => props.color !== undefined && props.color};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '700' : props.fontWeight};

  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center;
  line-height: normal;
  width: 100%;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;

  i {
    padding-right: 3px;
  }
`;
export const Labels = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '700' : props.fontWeight};
  line-height: normal;
  width: auto;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  /* white-space: nowrap; */
`;

export const LinhaKanban = styled.div`
  width: 100%;
  background-color: white;
  display: flex;
  overflow-x: auto;
  padding-top: 10px;
  padding-right: 10px;
  padding-left: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 0.9rem;
`;

export const Kanban = styled.div`
  color: #555555;
  height: auto;
  min-width: 300px;
  /* min-height: 50px; */
  max-height: 80vh;
  overflow-y: auto;

  max-width: 300px;
  margin-right: 15px;
  border: ${(props) =>
    props.cor !== undefined
      ? '1px solid ' + props.cor + '99'
      : '1px solid #ccc'};
  border-radius: 10px;
  padding: 0px 10px 0px 10px;
  .botaoSim {
    display: none !important;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: 95%;
    max-height: 70vh;
  }
`;
export const KanbanContainer = styled.div`
  color: #555555;
  height: auto;
  width: 100%;
  overflow-y: auto;
  padding-top: 5px;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 5px;
`;

export const DivBaseKanbanTituloPai = styled.div`
  background-color: ${(props) =>
    props.cor !== undefined ? props.cor : 'white'};
  color: white;
  padding-left: 5px;
  margin-top: 5px;
  border-radius: 4px;
`;

export const DivBaseKanban = styled.div`
  padding-left: 0px;
  padding-right: 0px;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  box-shadow: 0px 0px 4px 2px #ccc;
  /* ${(props) => (props.alerta ? '#c0392b' : '#2ecc71')}; */
  margin-bottom: 10px;
  width: 95%;
`;
