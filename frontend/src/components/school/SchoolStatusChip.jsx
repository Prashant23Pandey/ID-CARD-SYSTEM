import { Chip } from '@mui/material';
import {
  CheckCircleOutline,
  PauseCircleOutline,
  BlockOutlined,
  DeleteOutline,
} from '@mui/icons-material';

const statusConfig = {
  Active: {
    color: 'success',
    icon: <CheckCircleOutline fontSize="small" />,
    sx: { fontWeight: 600 },
  },
  Inactive: {
    color: 'default',
    icon: <PauseCircleOutline fontSize="small" />,
    sx: { fontWeight: 600 },
  },
  Suspended: {
    color: 'warning',
    icon: <BlockOutlined fontSize="small" />,
    sx: { fontWeight: 600 },
  },
  Deleted: {
    color: 'error',
    icon: <DeleteOutline fontSize="small" />,
    sx: { fontWeight: 600 },
  },
};

const SchoolStatusChip = ({ status, size = 'small', ...props }) => {
  const config = statusConfig[status] || statusConfig.Inactive;

  return (
    <Chip
      label={status}
      color={config.color}
      icon={config.icon}
      size={size}
      variant="outlined"
      sx={config.sx}
      {...props}
    />
  );
};

export default SchoolStatusChip;
