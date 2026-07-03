"""
Custom exception handler and exception classes.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import APIException

logger = logging.getLogger('apps')


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent JSON error responses.
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'success': False,
            'message': _extract_message(response.data),
            'errors': response.data,
            'status_code': response.status_code,
        }
        response.data = error_data
    else:
        # Unhandled exception
        logger.exception(f"Unhandled exception in {context.get('view')}: {exc}")
        response = Response(
            {
                'success': False,
                'message': 'An internal server error occurred.',
                'errors': None,
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response


def _extract_message(data):
    """Extract a human-readable message from DRF error data."""
    if isinstance(data, dict):
        for key in ('detail', 'non_field_errors', 'message'):
            if key in data:
                val = data[key]
                if isinstance(val, list):
                    return str(val[0])
                return str(val)
        # Return first field error
        for key, val in data.items():
            if isinstance(val, list):
                return f"{key}: {val[0]}"
            return f"{key}: {val}"
    if isinstance(data, list) and data:
        return str(data[0])
    return str(data)


class ServiceException(APIException):
    """Raised by service layer for business logic violations."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'A service error occurred.'
    default_code = 'service_error'


class PermissionDeniedException(APIException):
    """Raised when user lacks permission for an action."""

    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Permission denied.'
    default_code = 'permission_denied'


class ResourceNotFoundException(APIException):
    """Raised when a requested resource does not exist."""

    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found.'
    default_code = 'not_found'


class ConflictException(APIException):
    """Raised when an action conflicts with current state."""

    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Conflict with current state.'
    default_code = 'conflict'
