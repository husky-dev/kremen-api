#! /bin/sh

tee ./web/deputies/.env.dev <<EOF
ENV=dev
MAPS_API_KEY=AIzaSyB4xsXg0kWF8F6ey5Y8h44b1JekESaVCIg
EOF

tee ./web/deputies/.env.prd <<EOF
ENV=prd
MAPS_API_KEY=AIzaSyCDfFyXGQFPxVk813wgyIOiRvOu9f3Nvno
EOF
