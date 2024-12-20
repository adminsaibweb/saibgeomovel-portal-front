import styled from 'styled-components';

export const Container = styled.div`
  width: calc(100% - 64px);

  @media (max-width: 764px) {
    width: 100%;
    font-size: 0.9rem;

    div.professionalScheduleTitle {
      margin-top: 40px !important;
    }
  }

  height: 100%;

  position: absolute;
  overflow-y: auto;
  right: 0;

  h5.title {
    color: #bf1f7c;
    font-weight: 700;
    padding-left: 10px;
    margin: 20px 0 5px;
    text-transform: capitalize;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
  /* width: 100%; */
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
  flex-direction: ${(props) => (props.flexDirection ? props.flexDirection : 'column')};
  width: 100%;
  justify-self: flex-end;
  /* padding-top: 5px; */
  padding: 5px 10px 0;
  box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%);
  @media (max-width: 768px) {
    padding-top: 0px;
  }

  p {
    display: block;
  }

  table {
    tbody tr {
      height: 2.5rem;
      line-height: 2.5rem;

      td {
        height: 2.5rem;
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
  padding-left: 2px !important;

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
`;

export const Th = styled.th`
  padding: 15px 0 !important;
  flex: ${(props) => (props.flex ? props.flex : '1')};
  /* min-width: ${(props) => props.withMinWidth && '80px'}; */
  padding-left: 2px !important;
  width: ${(props) => props.buttonsIndicator && '23rem'};
`;
export const Tr = styled.tr`
  background-color: ${(props) => (props.clicked ? '#8e44ad29' : 'unset')};
  font-weight: 500;
  height: unset !important;
  line-height: unset !important;
`;

export const SeparetorTr = styled.tr`
  border-bottom: none !important;
  width: 100%;
  height: 10px !important;
`;

export const ContenTotal = styled.div`
  display: flex;
  font-weight: 500;
  margin: 0 3px;

  p {
    display: block;
  }
`;
export const LineTotal = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 10px 0;
`;
