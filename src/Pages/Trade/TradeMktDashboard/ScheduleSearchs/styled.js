import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  /* min-width: calc(100vw - 75px); */
  display: flex;
  height: 100vh;
  min-height: 100vh;
  /* padding: 10px; */
  background-color: #f1f1f11c;
  margin-left: 64px;
  align-items: center;
  align-items: flex-start;
  .hideMobile {
    div {
      /* border-bottom: 1px solid #ccc; */
      /* margin-bottom: 10px; */
      /* padding-bottom: 5px; */
      width: 99%;
    }
  }

  > span {
    padding: 10px;
  }

  h5.title {
    color: #bf1f7c;
    font-weight: 700;
    padding-left: 10px;
    margin: 20px 0 20px;

    font-size: ${(props) => props.isMobile && '1.5rem'};
  }

  .hideDesktop {
    display: none;
  }

  @media (max-width: 768px) {
    margin-left: 0px;
    margin-top: 50px;
    .hideMobile {
      display: none;
    }
    .hideDesktop {
      display: flex;
      flex-direction: column;
    }
  }

  .kpiUserGroupedIndicator {
    width: 100%;
    margin-left: 0px;
    min-height: auto !important;
  }

  .painelMonitoramento {
    background-color: white !important;
    color: white;
    font-weight: 700;
    font-size: 01rem;
    border-style: none;
    box-shadow: none !important;
    margin-bottom: 0px;
    margin-top: 0px;
    padding-bottom: 0px;
    padding-top: 0px;
  }

  .minus,
  .plus {
    color: #bf1f7c;
  }

  .painelMonitoramento .collapsible-header {
    background-color: white !important;
    color: white;
    font-weight: 700;
    font-size: 01rem;
    border-style: none;
    box-shadow: none !important;
    border-bottom: 1px solid #ccc;
    margin-bottom: 5px;
    padding-bottom: 2px;
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
  color: #000;

  /* overflow-x: scroll; */

  /* max-width: 310px; */
  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
  h2 {
    background: red;
  }

  p {
    font-weight: 700;
    color: #858585;
    width: 100%;
    text-align: center;
    padding: 5px;
    font-size: 20px;
    padding-top: 15px;
  }

  p.titleSearch {
    color: #bd207b;
    text-decoration: underline;
  }

  h6 {
    margin-top: 0px;
    margin-bottom: 0px;
    word-break: break-all;
    font-size: 13px;
    color: #525252;
    font-weight: bold;
  }

  div.detail {
    padding: 0;
  }

  input[type='file'] {
    display: none;
  }
  .collapsible {
    box-shadow: unset !important;
    border: none !important;
    padding: 0 !important;
    /* width: 100% !important; */

    @media (max-width: 720px) {
      min-width: unset;
      width: unset;
      margin-left: 0 !important;
    }
    @media (max-width: 400px) {
      min-width: calc() 250px !important;
      /* width: 250px !important; */
    }
  }

  .collapsible-header {
    background-color: #fff;
    padding-bottom: 5px;
    padding: 0 !important;
    color: white;

    i {
      margin: 0;
      align-self: center;
    }
    label {
      font-weight: 700;
      text-transform: none;
      font-size: 1.2rem;
    }
    font-size: 01rem;
  }
  .collapsible.expandable {
    margin: 0 10px;
  }
  li.collapsible_ .collapsible-header {
    background: rgba(189, 32, 123, 0.04);

    color: #000 !important;
    i.material-icons {
      margin-right: 0 !important;
    }
  }
`;

export const Table = styled.table`
  width: max-content;
  min-width: 100%;
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  /* width: 100%;
  /* padding-top: 5px; */

  padding: 5px 10px 0;
  max-width: 100%;
  overflow-x: auto;
  /* box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%); */
  @media (max-width: 768px) {
    padding-top: 0px;
  }

  table {
    width: max-content;
    thead tr {
      background: #f0f0f0;
    }
    tbody tr {
      height: 2.5rem;
      line-height: 2.5rem;

      td {
        height: 2.5rem;
      }
    }
  }
`;
export const Td = styled.td`
  /* border: 1px solid #c2c2c2; */
  flex: ${(props) => (props.flex ? props.flex : '1')};
  /* width: ${(props) => props.buttonsIndicator && '14rem'}; */
  display: ${(props) => props.buttonsIndicator && 'flex'};
  /* justify-content: ${(props) => props.buttonsIndicator && 'space-between'}; */
  width: 220px;
  align-items: ${(props) => props.buttonsIndicator && 'center'};
  text-align: ${(props) => (props.textAlign ? props.textAlign : 'unset')};
  padding: 0 5px 0 3px !important;

  span {
    font-size: 0.7rem;
    line-height: normal;
  }
  a {
    margin: 0 5px;
  }
  img {
    cursor: pointer;
    width: 30px;
    height: 30px;
    position: absolute;
    transform: translate(0, -50%);
    top: 0;
  }

  div {
    position: relative;
  }
`;
export const Th = styled.th`
  padding: 8px 10px 0 3px !important;
  flex: ${(props) => (props.flex ? props.flex : '1')};

  width: ${(props) => props.buttonsIndicator && '23rem'};
`;
export const Tr = styled.tr`
  background-color: ${(props) => (props.clicked ? '#8e44ad29' : 'unset')};
  font-weight: 500;
  line-height: 1rem;
  border-bottom: 1px solid #858585;
`;

export const ContentBodyCollapsible = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  /*
  width: max-content;
  width: 100%; */
  border: 1px solid #ccc;
  margin-bottom: 2px;
  border-radius: 10px;
  padding: 0 0 5px 5px;

  > div {
    flex-wrap: wrap;
    display: flex;
    width: 100%;
  }

  div.contentQuestions {
    @media (max-width: 700px) {
      max-height: unset;
    }
    flex-direction: column;
    max-height: 100px;
  }

  div.contentLabelsData {
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    text-align: center;
    margin: 0px;
    padding: 0px;
    width: 60%;
  }

  div.contentAllAgrupeds {
    /* margin-left: 0 !important; */
  }
`;

export const ContentDataSearchs = styled.div`
  margin: 0 10px;
  width: calc(100% - 20px);
  box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%);
  /* height: 100%; */
  /* overflow-y: scroll; */

  div.contentSearchs {
    width: max-content;
    flex-direction: column;

    width: 100%;
  }
`;
