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

  .minus1,
  .plus1 {
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

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 5px;

  @media (max-width: 768px) {
    padding-top: 0px;
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
  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
  h2 {
    background: red;
  }
  div {
    padding-top: 5px;
    /* margin-right: 5px; */
  }

  i {
    color: #000;
    margin: 0;
  }

  h6 {
    margin-top: 0px;
    margin-bottom: 0px;
    word-break: break-all;
    font-size: 13px;
    color: #525252;
    font-weight: bold;
  }
  input[type='file'] {
    display: none;
  }
  .collapsible {
    box-shadow: unset !important;
    border: none !important;
    padding: 0 !important;
  }
  .collapsible-header {
    background-color: #fff;
    padding-bottom: 5px;
    color: #c2c2c2;
    font-weight: 700;
    font-size: 1.2rem;
  }
  .collapsible-body {
    margin: 0 !important;
    padding: 0 !important;

    div {
      padding: 0 !important;
    }
  }
  .collapsible.expandable {
    margin: 0 !important;
  }
  li.collapsible_ .collapsible-header {
    background: rgba(189, 32, 123, 0.04);

    color: #000 !important;
    i.material-icons {
      margin-right: 0 !important;
    }
  }
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '0.9rem' : props.fontSize)};
  text-align: ${(props) => (props.textAlign === undefined ? 'unset' : props.textAlign)};
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  color: ${(props) => (props.color === undefined ? '#858585' : props.color)};
  font-weight: ${(props) => (props.fontWeight === undefined ? '400' : props.fontWeight)};
  line-height: ${(props) => (props.lineHeight === undefined ? 'unset' : props.lineHeight)};
  padding: ${(props) => (props.padding === undefined ? 'unset' : props.padding)};
  margin: ${(props) => (props.margin === undefined ? 'unset' : props.margin)};
  i {
    margin-right: 0px !important;
    width: auto !important;
  }
`;
