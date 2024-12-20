import styled, { keyframes, css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: ${(props) => props.isMobile && 'absolute'};
  height: ${(props) => (props.isMobile ? 'calc(100vh - 50px)' : '100vh')};
  min-height: 100vh;
  /* min-width: calc(100vw - 75px); */
  width: ${(props) => (props.isMobile ? '100%' : 'unset')};
  padding: 10px;
  background-color: #f1f1f11c;
  margin-left: 64px;
  
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

export const SubContainer = styled.div`
  /* margin: 5px; */
  padding: 5px;
  background-color: white;
  border: 1px solid #f1f1f1;
  border-radius: 4px;
  margin: 10px;
  width: 96%;
  /* width: calc(100vw - 90px); */
  box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    flex-direction: column;
    /* width: calc(100vw - 20px) !important; */
  }
`;

export const SubContainerTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
  text-align: left;
  /* width: 100%; */
  margin-left: 20px;
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

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

export const DataFilter = styled.div`
  flex: 1;
  font-weight: 700;
  flex-direction: row;
  display: flex;
  top: 9px;
  position: relative;
  font-weight: 700;
  @media (max-width: 768px) {
    margin-bottom: 6px;
  }

  .react-datepicker-wrapper {
    margin: 0px 10px 10px 10px;
    max-width: 100px;
  }
  .react-datepicker__input-container {
    input {
      font-size: 0.9rem !important;
      font-weight: 700 !important;
      border-bottom: 0px !important;
      margin-bottom: 0px !important;
      height: 30px;
    }
  }

  .react-datepicker {
    border: unset;
    box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    button {
      background-color: #8e44ad !important;
    }
  }

  .react-datepicker__triangle {
    display: none;
  }
  .react-datepicker__day:hover {
    background-color: #bf1f7c4f !important;
  }

  .react-datepicker__day--selected {
    background-color: #bf1f7c !important;
  }

  .react-datepicker__day--keyboard-selected {
    background-color: white;
    color: rgba(0, 0, 0);
  }

  .react-datepicker__header {
    background-color: #8e44ad;
  }

  .react-datepicker__header div {
    color: white !important;
  }
  .react-datepicker__header {
    border-bottom: unset;
  }

  .react-datepicker__today-button {
    background: #8e44ad;
    color: white;
    border-top: unset;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .react-datepicker__header {
    color: white;
  }

  .react-datepicker__month--selected {
    background-color: #bf1f7c;
  }

  .react-datepicker__month-text:hover {
    background-color: #bf1f7c4f !important;
  }

  .react-datepicker__month--selected {
    background-color: #bf1f7c !important;
  }

  .react-datepicker__day--in-range {
    background-color: #bf1f7c !important;
  }

  ${(props) =>
    props.loading === 1
      ? css`
          .material-icons {
            animation: ${rotate} 2s linear infinite;
            display: block;
            color: rgb(189, 32, 123);
            font-size: 1.4rem;
            position: absolute;
            top: 1px;
          }
        `
      : css`
          .material-icons {
            animation: unset;
            display: none;
            color: rgb(189, 32, 123);
            font-size: 1.4rem;
          }
        `};
`;

const slideLeftFilter = keyframes`
    from {
        transform: translateX(-100%);
    }

    to {
        transform: translateX(0%);
    }
`;

const slideRightFilter = keyframes`
    from {
        transform: translateX(+100%);
    }

    to {
        transform: translateX(0%);
    }
`;

export const DataFilterGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  font-size: 0.9rem;
  font-weight: 700;
  position: relative;
  top: 12px;
  margin-right: 10px;
  margin-left: 10px;
  @media (max-width: 768px) {
    top: unset;
    justify-content: unset;
    margin-bottom: 15px;
    margin-left: unset;
  }
  div {
    padding: 0px 10px 0px 10px;
    height: 22px;
    cursor: pointer;
    animation: ${slideLeftFilter} 0.5s linear;
    hr {
      color: #8e44ad;
      height: 1px;
      background-color: #8e44ad;
    }
  }
  .dataFilterGroupDayHr {
    display: ${(props) => (props.selected === 1 ? 'block' : 'none')};
    animation: ${(props) => (props.priorSelected < props.selected ? slideLeftFilter : slideRightFilter)} 0.5s linear;
  }
  .dataFilterGroupMonthHr {
    display: ${(props) => (props.selected === 2 ? 'block' : 'none')};
    animation: ${(props) => (props.priorSelected < props.selected ? slideLeftFilter : slideRightFilter)} 0.5s linear;
  }
  .dataFilterGroupCustomHr {
    display: ${(props) => (props.selected === 3 ? 'block' : 'none')};
    animation: ${(props) => (props.priorSelected < props.selected ? slideLeftFilter : slideRightFilter)} 0.5s linear;
  }
`;

export const DataFilterButton = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 0.9rem;
  margin-top: 6px;
  justify-content: space-between;
  p {
    display: flex !important;
    align-items: center !important;
    margin-bottom: 3px !important;
  }
  @media (max-width: 768px) {
    margin-left: 6px;
    margin-bottom: 5px;
    margin-top: -4px;
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
  input[type='file'] {
    display: none;
  }
  .collapsible {
    box-shadow: unset !important;
    border: none !important;
    padding: 0 !important;
  }
  .collapsible-header {
    background-color: #8e44ad;
    padding-bottom: 5px;
    color: white;
    font-weight: 700;
    font-size: 01rem;
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

export const RowClientSchedule = styled.div`
  display: flex;
  align-items: center;

  border: 1px solid rgba(189, 32, 123, 0.1);
  margin-left: 10px;
  height: 40px;
  h6 {
    font-weight: 500 !important;
    padding-left: 4px;
  }

  button {
    background: #e91e63 !important;
    border-color: #e91e63 !important;
    height: 21px !important;
  }
`;

export const LinhaEachGroup = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  padding: 0 10px;
  margin: 5px;
  display: flex;
  align-items: stretch;
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
  input[type='file'] {
    display: none;
  }
  .collapsible {
    box-shadow: unset !important;
    border: none !important;
    padding: 0 !important;
  }
  .collapsible-header {
    background-color: #8e44ad;
    padding-bottom: 5px;
    color: white;
    font-weight: 500;
    font-size: 01rem;
  }
  .collapsible.expandable {
    margin: 0 !important;
  }
  li.collapsible_ .collapsible-body {
    margin-top: 0 !important;
    padding-top: 0 !important;
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
  padding-top: 5px;

  @media (max-width: 768px) {
    padding-top: 0px;
  }
`;

export const Line = styled.div`
  display: flex;
  flex-direction: row;
  align-items: ${(props) => (props.loading === 1 ? 'inherit' : 'center')};
  @media (max-width: 768px) {
    flex-direction: column;
    /* width: calc(100vw - 20px) !important; */
    align-items: center !important;
  }
`;

export const Graph = styled.div`
  display: flex;
  flex-direction: column;
  h6 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #858585;
    text-align: center;
    margin-bottom: 28px;
  }
  /* box-shadow: rgba(0,0,0,0.1) 0px 0px 2px 2px; */
  margin-right: 5px;
  padding-bottom: 10px;
  canvas {
    height: 170px !important;
    width: 360px !important;
  }
`;

export const IndicatorsLine = styled.div`
  border-left: 1px solid #ccc;
  padding: 10px;
  flex-wrap: wrap;
  display: flex;
  flex-direction: ${(props) => (props.loading === 1 ? 'column' : 'row')};
  margin-top: 5px;
  @media (max-width: 768px) {
    display: ${(props) => (props.loading === 1 ? 'none' : 'flex')};
  }
  justify-content: flex-start;
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
