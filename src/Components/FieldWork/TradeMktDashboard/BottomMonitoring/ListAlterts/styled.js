import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.2rem;
  width: 100%;
  min-width: 300px;
  height: 100%;
  overflow-y: auto;
  box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%);  

  @media (max-width: 768px) {
    max-height: 250px;
  }
`;
export const P = styled.p`
  flex: ${(props) => props.flex};
  margin: 0 3px;
`;
export const ContentListAlerts = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ContentBodyModal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 5px;
  margin-top: 0.5rem;
`;

export const ContentBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: #7e3a9d;

  border-bottom: 1px solid #7e3a9d;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.2rem;

  .alerts {
    display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 160px;

  gap: 3px;

  > span {

    @media (max-width: 1300px) {
      white-space: ${props => !props.full && "nowrap"}; 
      overflow: ${props => !props.full && "hidden"};
      max-width: ${props => !props.full && "190px"};
      text-overflow: ${props => !props.full && "ellipsis"};
    }

    @media (min-width: 1300px) {
      white-space: ${props => !props.full && "nowrap"}; 
      overflow: ${props => !props.full && "hidden"};
      max-width: ${props => !props.full && "210px"};
      text-overflow: ${props => !props.full && "ellipsis"};
    }
    
  }
  }
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 3px;

  .observation {
    display: flex;
    flex-wrap: wrap;

    > span {
      word-break: break-word;
      font-weight: bold;
    }
  }
`

export const ContentDescription = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 3px;

  > i {
    font-size: 20px;
  }
`

export const HeaderAlerts = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  padding-bottom: 0.3rem;
  border-bottom: 1px solid rgb(0 0 0 / 10%);
  width: 100%;

  > div.titleList {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 2px;

    i,
    h5 {
      margin: 0;
      color: #bd207b;
      font-weight: 500;
      font-size: 1.2rem;
    }

    h5 {
      margin-top: -2px;
    }
  }
`

export const ButtonSeen = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px; 
  font-size: 0.9rem;

  border: 0;
  outline: none;
  padding: 0.3rem;
  border-radius: 5px;
  
  background: ${props => props.color};
  color: #fff;
  transition: all 0.2s linear;
  
  &:hover {
    background: ${props => props.hover};
  }

  &:focus {
    background: ${props => props.hover};
  }
`