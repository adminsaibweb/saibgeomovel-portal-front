import styled from "styled-components"

export const Container = styled.div`
  background-color: #fff;
  height: 100vh;
  width: calc(100vw - 60px);
  

  @media (min-width: 769px) {
    margin-left: 60px !important;
  }
  @media (max-width: 768px) {
    width: 100vw;
  }

  .collapsible {
    width: 100%;
    margin: 0.2rem 0 0.4rem !important;
  }

  .collapsible-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 5px 5px;
    font-size: 0.9rem;
    font-weight: 900;
    color: white;
    background-color: #8E44AD;
    margin: 0 0.5rem;
}
`

export const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  background: #fff;
  width: 100%;
`

export const ContainerDatas = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  padding: 0 0.6rem;

  > h5 {
    margin: 0;
    font-size: 1rem;
    font-weight: bold;
  }
`



export const DataFilter = styled.div`
  flex: 1;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.2rem;
  position: relative;
  font-weight: 700;

  margin: 0;
  padding: 0;

  > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    > h5 {
      color: #9E9E9E;
      font-size: 1rem;
      font-weight: bold;
    }
  }

  > div + div {
    margin-left: 2rem;
  }

  @media (max-width: 768px) {
    margin-bottom: 6px;
  }
  .react-datepicker-wrapper {
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
  
`

export const ContainerSelectedPayment = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  margin-left: 3rem;
  min-width: 20%;  

  > h5 {
    margin: 0.7rem 0;
    font-size: 1rem;
    font-weight: bold;
  }

  @media (max-width: 520px) {
    margin-left: 0.7rem;
  }
`

export const ContainerCodPayment = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  
  margin-left: 0.7rem;

  > h5 {
    margin: 0.5rem 0;
    font-size: 1rem;
    font-weight: bold;
  }

  @media (max-width: 1055px) {
    margin-left: 0.7rem;
    margin-top: 0.3rem;
  }
`

export const InputCod = styled.input`
  width: 160px;  
  border-bottom: 1px solid #ccc !important;
`

export const ContainerStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  

  margin-left: 0.7rem;

  > h5 {
    margin: 0;
    font-size: 1rem;
    font-weight: bold;
  }

  @media (max-width: 1055px) {
    margin-left: 0.7rem;
    margin-top: 0.3rem;
  }
`
export const ContainerInfos = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.3rem;

  overflow-x: auto;
  margin: 0.2rem 1rem;
  
  @media only screen and (max-width: 925px) {
    gap: 0.8rem;
  }
`

export const Kanban = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 80vh;
  
  border-radius: 10px;
  
  border: ${props => (props.color !== undefined ? '1px solid ' + props.color + '99' : '1px solid #8870A4')};

  .titleContainer {
    margin: 0.4rem 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background: ${props => (props.color !== undefined ? props.color : "#8870A4")};
    width: 95%;
    padding: 0.1rem;

    border-radius: 4px;
 
    > span {
      
      font-size: 0.9rem;
      color: #fff;
      padding: 0 0.2rem;
    }
  }
`

export const DivContentKanban = styled.div`
  max-width: 450px !important;
  min-width: 300px;
  height: 95%;
  padding: 0px 10px 0px 10px;

  box-sizing: content-box;
  overflow-y: auto;
  overflow-x: hidden;

  ::-webkit-scrollbar-thumb {    
    background: ${props => (props.color !== undefined ? props.color : "rgba(136,112,164,0.3)")};
  }
  
`

export const KanbanContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
`

export const ContainerPagination = styled.div`
  .pagination {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem;
    
    border-bottom-left-radius: 10px;  
    border-bottom-right-radius: 10px; 

    li.active {
      background-color: #8E44AD !important;
      transition: all 0.2s linear;
      &:hover {
        background-color: rgba(142,68,173,0.94) !important; 
      }
    }

    li:nth-child(1) {
      display: flex;
      justify-content: start;
      align-items: flex-start;
      flex: 1;
    }
    li:last-child {
      display: flex;
      justify-content: end;
      align-items: flex-start;
      flex: 1;
    }

    li i {
      color: #8E44AD;
    }

    li.disabled a {
      cursor: default;
      color: #999;

      > i {
        color: #999;
      }
    }
    
  }
`;

export const ButtonFiltered = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 10px 0 0 10px !important;

  > button {
    display: flex;
    align-items: center;
    border-radius: 100px;
    padding: 0.5rem 1rem;

    border: none;
    box-shadow: 0px 2px 10px 1px rgba(142,68,173,0.25);
    background: #8E44AD;
    color: #fff;
    font-weight: bold;

    > i {
      margin-right: 3px;
    }

    transition: all 0.2s linear;

    &:hover {
      background: #843fa2;
    }

    @media (max-width: 1060px) {
      margin-left: 0.4rem;
      margin-top: 0.4rem;
    }
  }
`