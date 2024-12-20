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

  .filterTypeSearch,
  .filterSituationSearch {
    padding: 0 5px 5px 5px;
    font-weight: 700;
  }

  .contentFilterCodTeam {
    flex: 3;
    min-width: 200px;
    margin-left: 5px;
    .inputRadio {
      display: flex;
    }
    label {
      text-transform: none;
    }
  }
`;

export const ContentDetailsItemKanban = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  label {
    display: flex;
    align-items: center;

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
    font-weight: 700;
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
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;

  width: 100%;
  margin-bottom: 0;

  input {
    margin-bottom: 0;
    margin-left: 12px;
    margin-top: 7px;
  }

  .btn-filter {
    > button {
      > i {
        margin-right: 4px;
      }
    }
  }

  @media only screen and (max-width: 768px) {
    min-width: 100%;
    flex: 1;

    div.filter {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 210px;
  }

  .filter.team {
    width: 350px;
  }
  }
  div.content-input {
    flex: 6;
    min-width: 250px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-left: 7px;
    /* width: 100%; */
    input {
      text-transform: capitalize !important;
    }
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input.validate.valid {
    border-bottom: 1px solid #c2c2c2 !important;
    box-shadow: 0 1px 0 0 #c2c2c2 !important;
  }

  div.first.filter {
    margin-top: 0;
  }

  div.filter {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 230px;
  }

  div.contentAllFilters {
    width: 100%;
  }

  div.contentRadiusFilter {
    flex: 1;
  }

  span {
    color: #858585 !important;
    font-weight: 700;
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
  padding: 0px 5px 0px 5px;
  width: 100%;
  text-transform: capitalize;
  flex-wrap: wrap;
  @media (max-width: 768px) {
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
    padding: 0.3rem !important;
  }
  .collapsible-body {
    padding: 0px;
    margin-bottom: 2px;
  }
  .collapsible {
    box-shadow: unset !important;
    /* padding: unset !important; */
    margin-bottom: 0px !important;
    margin-top: 0px !important;
    border: 0;
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

export const LinhaContentHeaderKanBan = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 0.5rem;
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
  label.labelDescriptionSupervisor,
  label.labelDescriptionPromoter {
    font: 0.5rem !important;
    display: flex;
  }

  .eachProfessional {
    margin-bottom: 10px;
  }
`;

export const LabelsFilter = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '700' : props.fontWeight};
  text-transform: none;
  width: 150px;
  min-width: 150px;
  /* overflow: hidden;
  text-overflow: ellipsis; */
  white-space: nowrap;
`;

export const Labels = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  /* color: ${(props) => (props.valor === 'Não' ? '#000' : 'red')}; */
  color: ${(props) => (props.color !== undefined ? props.color : '#4d4d4d')};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '700' : props.fontWeight};
  text-align: ${(props) => (props.textAlign ? props.textAlign : 'unset')};
  line-height: normal;
  width: auto;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  text-decoration: ${(props) => (props.textDecoration ? props.textDecoration : 'initial')};
  text-transform: uppercase;
  /* white-space: nowrap; */
`;

export const LinhaKanban = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  background-color: white;
  overflow-y: auto;

  width: 100%;
  padding-top: 10px;
  padding-right: 10px;
  padding-left: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 0.9rem;
`;

export const DivBaseKanban = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  box-shadow: 0px 0px 4px 2px #ccc;
  padding: 0 0.2rem;
  /* ${(props) => (props.alerta ? '#c0392b' : '#2ecc71')}; */
  margin-bottom: 10px;

  min-width: 300px;
`;

export const LinhaBtnsModal = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7%;
  padding: 0 5px 10px;
  margin-top: 1rem;
`;

export const ContainerModal = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  > h1 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 500;
    word-break: break-word;
    color: #8e44ad;
  }
`

export const ActionsModal = styled.div`
  display: flex;
  align-items: center;
  justify-content: center !important;
  gap: 5px;
  text-align: center !important;

  > button {
    background-color: #8e44ad !important;
    border-color: #8e44ad !important;
    font-size: 1.4rem;

    &:hover {
      background-color: #7e3a9d !important;
      border-color: #7e3a9d!important;
      color: #ffffff!important;
      text-decoration: none!important;
    }
    > i {
      margin-right: 3px;
      font-size: 1.4rem;
        &:hover {
          background-color: #7e3a9d !important;
          border-color: #7e3a9d!important;
        }
    }
  }
  &:hover {
    background: none !important;
    border-color: none !important;
  }
`
