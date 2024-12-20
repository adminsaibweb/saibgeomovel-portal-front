import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center !important;
  /* min-width: calc(100vw - 75); */
  /* min-height: 100vh; */
  background-color: #f1f1f11c;
  margin-left: 70px;
  align-items: flex-start;
  @media (max-width: 768px) {
    margin-left: 0px;
    padding-top: 50px;
  }

  .linhaCampo{
    padding-bottom: 30px;
    padding-top: 0px;
  }

  .linhaPesquisa {
    flex-direction: row !important;
    i {
      color: #858585;
    }
  }

  .serviceSearchItems {
    overflow-y: auto;
    padding-bottom: 100px;
    table {
      padding-bottom: 50px;
      margin-bottom: 50px;
    }
  }


  .linhaItemPertuntasTitulo{
    background-color: #8e44ad!important;
    text-align: center!important;
    padding-top: 0px!important;
    padding-bottom: 0px!important;
  }

  .linhaAgrupamento{
    padding-bottom: 0px!important;
    flex-direction: row;
  }

  .linhaAgrupamentoTitulo {
    flex-direction: row !important;
    margin-bottom: 0px !important;
    padding-bottom: 20px !important;
    padding-bottom: 10px !important;
    flex-wrap: wrap;
    overflow-x: auto;
    box-shadow: 0px 0px 12px 0px rgb(0 0 0 / 10%);
  }


  .linhaItemAgrupamentoTitulo {
    flex-direction: row !important;
    margin-bottom: 10px !important;
    padding-bottom: 20px !important;
    padding-bottom: 10px !important;
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .linhaAgrupamentoTitulo .itemAgrupamento {
    align-items: center;
    width: 100px !important;
    /* text-transform: capitalize!important; */
    max-width: 100px !important;
    min-width: 100px !important;
    word-break: break-all;
    text-align: center;
    padding: 5px;
    border: 1px solid #ccc;
    background-color: white !important;
    border-radius: 10px;
    margin-right: 5px !important;
    box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    justify-content: center;
    margin-bottom: 5px!important;
  }

  .linhaItemAgrupamentoTitulo .itemAgrupamento {
    align-items: center;
    width: 100px !important;
    /* text-transform: capitalize!important; */
    max-width: 100px !important;
    min-width: 100px !important;
    word-break: break-all;
    text-align: center;
    padding: 5px;
    border: 1px solid #ccc;
    background-color: white !important;
    border-radius: 10px;
    margin-right: 5px !important;
    box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    justify-content: center;
  }

  .linhaAgrupamentoTitulo .itemAgrupamento .skuImage {
    width: 24px !important;
  }

  .linhaAgrupamentoTitulo .linhaFlag {
    flex-direction: row;
    justify-content: flex-end;
    padding-left: 0px;
    padding-right: 0px;
    padding-bottom: 0px;
    padding-top: 0px;
    margin-bottom: 0px;
    margin-right: 0px;
    margin-top: 0px;
    margin-left: 0px;
    position: relative;
    top: -5px;
    left: 8px;
  }

  .linhaAgrupamentoTitulo .linhaFlag i {
    color: #8e44ad;
  }



`;

export const SubContainer = styled.div`
  /* margin: 5px; */
  padding: 5px;
  margin-top: 10px;
  background-color: white;
  border: 1px solid #f1f1f1;
  border-radius: 4px;
  /* min-width: calc(100vw - 90px); */
  width: calc(100% - 20px);
  box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    flex-direction: column;
    /* width: 100% !important; */
    margin-top: 30px;
    .carrossel {
      color: red !important;
    }
  }

  /* td{
    padding-left: 5px!important;
  }

  .tradeTable tbody tr td:hover {
    color: red;
  } */
`;

export const SubContainerTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
  text-align: left;
  margin-left: 20px;
  @media (max-width: 768px) {
    color: #bf1f7c;
    font-size: 2rem;
    width: 100%;
    text-align: center;
    margin-left: 0px;
  }
`;

export const LineTopFilter = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 0.9rem;
  justify-content: space-between;
  border-bottom: 1px solid #cccccc47;
  height: 37px;
  width: 100%;
  flex-wrap: wrap;
  padding-bottom: 50px;
  @media (max-width: 768px) {
    margin-left: 0px;
    height: auto;
    flex-direction: column;
    padding-bottom: unset;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px;
  margin: 5px;
  display: flex;
  align-items: stretch;
  /* margin-bottom: ${(props) => props.setMargin ? '50px' : 'unset'}; */
  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
  div {
    padding-top: 5px;
    margin-right: 5px;
  }
  p {
    display: none;
  }
  h6 {
    margin-top: 0px;
    margin-bottom: 0px;
    word-break: break-all;
    font-size: 13px;
    color: #525252;
    font-weight: bold;
  }

  h5 {
    margin-top: 0px;
    margin-bottom: 0px;
    word-break: break-all;
    font-size: 1rem3px;
    color: #8e44ad;
    font-weight: bold;
  }
  input[type='file'] {
    display: none;
  }
  .collapsible-header {
    background-color: #8e44ad;
    padding-bottom: 5px;
    color: white;
    font-weight: 700;
    font-size: 01rem;
  }

  .inputFileUpload {
    display: none;
  }
`;

export const Alert = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;

  > span {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    font-size: 1.2rem;
    color: #8e44ad;
    font-weight: bold;
  }

  > strong {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;

    font-size: 1.2rem;
    color: #bf1f7c;
    font-weight: bold;
  }
`

export const StopWatch = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background: rgb(233,30,99);
  background: linear-gradient(90deg, rgba(233,30,99,1) 0%, rgba(142,68,173,1) 60%, rgba(142,68,173,1) 100%);
  border-radius: 10px;
  margin: 7px;

  > h5 {
    margin: 5px;
    color: #fff;
    font-weight: 700;
    font-size: 1.3rem;
    text-align: center;
    padding: 0 1rem;
    word-break: break-word;
  }

  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;

    padding: 0.3rem;

    > span {
      color: #fff;
      font-size: 1.3rem;
    }

    > strong {
      color: #fff;
      font-weight: 700;
      font-size: 1.3rem;
    }
  }
`

export const StopWatchHome = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  background: rgb(233,30,99);
  background: linear-gradient(90deg, rgba(233,30,99,1) 0%, rgba(142,68,173,1) 60%, rgba(142,68,173,1) 100%);
  border-radius: 5px;
  padding: 5px;

  margin-top: 5px;

  > h5 {
    color: #fff;
    font-weight: 700;
    font-size: 1.1rem;
    text-align: center;
    word-break: break-word;
  }

  > span {
    color: #fff;
    font-size: 1.1rem;
    font-weight: 600;
  }

  > strong {
    color: #fff;
    font-weight: 700;
    font-size: 1.1rem;
  }
`

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 5px;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  @media (max-width: 768px) {
    padding-top: 0px;
  }
`;

export const Labels = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.color === undefined ? '#858585' : props.color)};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '500' : props.fontWeight};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '500' : props.fontWeight};
  line-height: ${(props) =>
    props.lineHeight === undefined ? 'unset' : props.lineHeight};
  padding: ${(props) =>
    props.padding === undefined ? 'unset' : props.padding};
  margin: ${(props) => (props.margin === undefined ? 'unset' : props.margin)};
  // text-decoration-line: ${(props) => (props.red !== undefined && props.red === 'sim' ? 'unset' : 'underline')};
  // text-decoration-style: ${(props) => (props.red !== undefined && props.red === 'sim' ? 'unset' : 'wavy')};
  // text-decoration-color: ${(props) => (props.red !== undefined && props.red === 'sim' ? 'unset' : 'red')};

`;

export const Titulo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  background-color: #8e44ad;
  color: white;
  width: 100%;
  text-align: center;
  height: 50px;
  z-index: 1;
  @media (max-width: 768px) {
    height: 50px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    position: fixed;
    top: -18px;
    p {
      position: relative;
      top: 10px;
    }
  }
`;

export const FooterPage = styled.div`
  width: 100%;
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  position: fixed;
  top: calc(100% - 60px);
  border-top: 1px solid #ccc;
  background-color: white;
  z-index: 10;
  height: 60px;
`;

export const DayCard = styled.div`
  flex-direction: column;
  padding-top: 5px;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  @media (max-width: 768px) {
    padding-top: 0px;
  }
  align-items: center;
  padding: 0px 5px;
  border-right: 1px solid #ccc;
  cursor: pointer;
  text-align: center;
  color: #858585;
  font-weight: 500;
  display: ${(props) =>
    props.display !== undefined ? props.display : 'unset'};
`;

export const DayCardChecked = styled.span`
  border-bottom: 3px solid #8e44ad;
  height: 9px;
  width: 100%;
  display: ${(props) =>
    props.display !== undefined ? props.display : 'unset'};
`;

export const TradeTitle = styled.h4`
  font-weight: 700;
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
  color: #bf1f7c;
  font-size: 2rem;
  width: 100%;
  text-align: center;
  margin-left: 0px;
  @media (max-width: 768px) {
    padding-top: 50px;
  }
`;


export const UploadFile = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: flex-start;
  padding-left: 8px !important;
  label {
    margin-top: 5px !important;
  }
  input[type='file'] {
    display: none;
  }
`;

export const MessageUnavailable = styled.span`
  background: rgb(233,30,99);
  background: linear-gradient(90deg, rgba(233,30,99,1) 0%, rgba(142,68,173,1) 60%, rgba(142,68,173,1) 100%);
  border-radius: 10px;
  margin: 5px;
  padding: 5px 10px;

  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  text-align: center;
`
