import { TextBox } from '@components/text-box';
import { Button } from 'antd';
import styled from 'styled-components';
import { RoomData } from './type';
import { RoomItem } from './RoomItem';

export const RoomInfo = ({ roomData }: { roomData: RoomData[] }) => {
  return (
    <StyledWrapper>
      <StyledHeadContainer>
        <TextBox typography="h4" fontWeight={700}>
          객실 정보
        </TextBox>
        <StyledButton type="primary">+ 객실추가</StyledButton>
      </StyledHeadContainer>
      <StyledRoomListContainer>
        <RoomItem roomData={roomData} />
      </StyledRoomListContainer>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .ant-btn {
    .anticon + span {
      margin-left: 0;
    }
    .span {
      display: block;
    }
  }

  .ant-tag {
    display: flex;
    justify-content: center;
  }
`;

const StyledHeadContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledButton = styled(Button)`
  font-size: 18px;
  font-weight: 700;

  display: flex;
  align-items: center;
`;

const StyledRoomListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;