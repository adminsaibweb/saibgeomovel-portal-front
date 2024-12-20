import styled from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  /* height: 100vh; */
  overflow-y: auto;
  width: calc(100vw - 60px);
  @media (min-width: 769px) {
    margin-left: 60px !important;
  }
  @media (max-width: 768px) {
    padding-left: 1%;
    width: 99%;
  }

  .filter,
  .topLine {
    margin-top: 10px;
  }
  .containerFlow div table tbody tr td label {
    padding-left: 10px !important;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0px 10px 0px 10px;
  width: 100%;
  /* text-transform: capitalize; */
  flex-wrap: wrap;
  .checkBoxLine button {
    margin: 0px 1px;
    padding: 0px 10px 0px 10px;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    .checkBoxLine label {
      padding-left: 15px;
    }
    .checkBoxLine button {
      margin-bottom: 5px;
    }
    /* width: 100%; */
    /* align-items: center; */
  }
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
    width: 100%;
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
