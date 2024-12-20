import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  /* min-width: calc(100vw - 75px); */
  display: flex;
  /* justify-content: space-between; */
  /* height: 100vh; */
  min-height: 100vh;
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
  h5.title {
    color: #bf1f7c;
    font-weight: 700;
    padding-left: 10px;
    margin: 20px 0 5px;

    font-size: ${(props) => props.isMobile && '1.5rem'};
  }
  div.collapsibleClient {
    text-align: right;
    margin: 0px;
    padding: 0px;

    flex-direction: row;
    justify-content: space-between;
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
  /* align-items: stretch; */

  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
  h2 {
    background: red;
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

  .labelStatus {
    max-width: 70%;
    display: block !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
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
    margin: 0 10px !important;
  }
  li.collapsible_ .collapsible-header {
    background: rgba(189, 32, 123, 0.04);

    color: #000 !important;
    i.material-icons {
      margin-right: 0 !important;
    }
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  /* padding-top: 5px; */
  padding: 5px 10px 0;
  box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%);
  @media (max-width: 768px) {
    padding-top: 0px;
  }

  table {
    tbody tr {
      height: 3.5rem;
      line-height: 3.5rem;

      td {
        height: 3.5rem;
        /* display: flex;
        align-items: center; */
      }
    }
  }
`;

export const ContentBodyCollapsible = styled.div`
  display: flex;
  border: 1px solid #ccc;
  margin-bottom: 2px;
  border-radius: 10px;
  height: 110px;
  padding: 0 0 5px 5px;
  div.contentLabelsData {
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    text-align: center;
    margin: 0px;
    padding: 0px;
    width: 60%;
  }
`;

export const ContentButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 46%;
  padding: 0;

  div.lineButtons {
    flex-direction: column;
    color: white;
    justify-content: space-around;
    width: max-content;
    max-width: 500px;
    align-items: flex-end;
    min-height: 100px;
    padding: 0;
  }
`;

export const Labels = styled.label`
  align-self: ${(props) => (props.alignSelf ? props.alignSelf : 'unset')};
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
export const Td = styled.td`
  flex: ${(props) => (props.flex ? props.flex : '1')};
  /* width: ${(props) => props.buttonsIndicator && '14rem'}; */
  display: ${(props) => props.buttonsIndicator && 'flex'};
  /* justify-content: ${(props) => props.buttonsIndicator && 'space-between'}; */

  align-items: ${(props) => props.buttonsIndicator && 'center'};
  text-align: ${(props) => (props.textAlign ? props.textAlign : 'unset')};
  background-color: ${(props) => (props.temperature !== undefined ? props.temperature : 'unset')};
  padding: 0 5px 0 0 !important;
  line-height: 16px !important;
  span {
    font-size: 0.7rem;
    line-height: normal;
  }
  a {
    margin: 0 5px;
  }

  .photoButton,
  .scheduleButton,
  .mapButton {
    margin-top: 1px;
    height: 28px;
    span {
      font-size: 1rem;
    }
  }

  height: unset !important;
`;

export const Th = styled.th`
  padding: 15px 0 !important;
  flex: ${(props) => (props.flex ? props.flex : '1')};
  /* min-width: ${(props) => props.withMinWidth && '80px'}; */

  width: ${(props) => props.buttonsIndicator && '23rem'};
`;
export const Tr = styled.tr`
  background-color: ${(props) => (props.clicked ? '#8e44ad29' : 'unset')};
  font-weight: 500;
  height: unset !important;
  line-height: unset !important;
`;
