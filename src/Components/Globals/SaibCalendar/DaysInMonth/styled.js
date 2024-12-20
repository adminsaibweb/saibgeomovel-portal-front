import styled from 'styled-components';

export const Container = styled.div`
  height: calc(100vh - 180px);
  overflow-y: scroll;
`;
export const Day = styled.div`
  height: 110px;
  flex: 1;
  min-width: 80px;
  border: 1px solid #efefef;
  font-weight: 500;
  padding: 5px;

  cursor: pointer;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  background: ${(props) => props.clicked && '#efefefb3'};
`;
export const RowDays = styled.div`
  display: flex;
`;
